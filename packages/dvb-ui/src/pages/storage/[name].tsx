import Wrapper from '../../components/wrapper';
import { useStorageQuery, useDeleteBackupMutation, useDownloadBackupMutation, StorageBackup, useDeleteMultipleBackupsMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import { Text, Skeleton, AlertIcon, Alert, Table, Tbody, Th, Thead, Tr, Td, Button, Box, Flex, useToast, Tooltip, Input, CircularProgress, Checkbox, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Progress } from '@chakra-ui/react';
import Title from '../../components/title';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { CheckIcon, DeleteIcon, DownloadIcon, RepeatIcon } from '@chakra-ui/icons';
import ConfirmDelete from '../../modals/confirm-delete';
import SortableTable, { SortableTableHeader } from '../../components/sortable-table';
import dayjs from 'dayjs';
import { formatBytes } from '../../utility/format-bytes';
import { Task } from '../../components/task';
import { uniq } from 'lodash';

function prettyStorageType(type: string) {
  switch (type) {
    case 'local': return 'a Local File System';
    case 's3Bucket': return 'an S3 Bucket';
    case 'ftpServer': return 'an FTP Server';
    default: return `a ${type}`;
  }
}

export default function Storage(): any {
  const router = useRouter();
  const name = router.query.name as string;
  const [ filter, setFilter ] = useState('');
  const [ deleteBackup ] = useDeleteBackupMutation();
  const [ deleteMultipleBackups ] = useDeleteMultipleBackupsMutation();
  const [ downloadBackup ] = useDownloadBackupMutation();
  const { data, loading, error, refetch } = useStorageQuery({
    variables: {
      name,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    skip: !name
  });
  const toast = useToast();
  const download = useCallback(async (fileName: string, track: (id: string) => void) => {
    const storage = name;
    const result = await downloadBackup({
      variables: {
        storage,
        fileName,
      },
    });
    if (result.data?.downloadBackup) {
      track(result.data!.downloadBackup);
    } else {
      toast({
        title: 'Failed to download backup file.',
        description: `${storage}/${fileName}`,
        status: 'error',
      });
    }
  }, [ name ]);
  const downloadFile = useCallback(async (fileName: string) => {
    (document as any).location = `${process.env.NEXT_PUBLIC_API || 'http://localhost:1998/api'}${fileName}`;
  }, [ name ]);
  const filtered = useMemo(() => {
    if (data?.storage) {
      return data.storage.backups.filter(backup => backup.fileName.includes(filter));
    }
    return [];
  }, [ data, filter ]);
  const filterLength = useMemo(() => {
    return filtered.length;
  }, [ filtered ]);

  const [ checkedFiles, setCheckedFiles ] = useState([] as string[]);
  const toggleChecked = useCallback((name: string) => {
    if (checkedFiles.includes(name)) {
      setCheckedFiles(value => value.filter(item => item != name))
    } else {
      setCheckedFiles(value => ([ ...value, name ]))
    }
  }, [ checkedFiles ]);
  const selectAll = useCallback(() => {
    if (filter.length === 0) {
      setCheckedFiles((data?.storage?.backups || []).map(item => item.fileName));
    } else {
      setCheckedFiles(value => uniq([ ...value, ...filtered.map(item => item.fileName) ]));
    }
  }, [ filtered ]);
  const deselectAll = useCallback(() => {
    if (filter.length === 0) {
      setCheckedFiles([]);
    } else {
      setCheckedFiles(value => value.filter(item => !filtered.map(item => item.fileName).includes(item)));
    }
  }, [ filtered ]);
  useEffect(() => {
    setCheckedFiles([]);
  }, [ loading ]);
  const allFilesSelected = checkedFiles.length === (data?.storage?.backups || []).length;

  const deleteMultiple = useCallback(async (list: string[], track: (id: string) => void) => {
    const response = await deleteMultipleBackups({
      variables: {
        storage: name,
        fileNames: list,
      },
    });
    if (response.data) {
      const taskId = response.data!.deleteMultipleBackups;
      track(taskId);
    }
  }, [ name ]);

  if (!name) {
    return <></>;
  }
  return <Wrapper>
    <Title>{ name }</Title>
    <Flex mt={ 4 }>
      <Text as="h1" fontSize="4xl">{ name }</Text>
      <Box ml="auto" mt="auto">
        <Button size="lg" p={ 0 } variant="ghost" colorScheme="green" onClick={ () => refetch() } isLoading={ loading }><RepeatIcon /></Button>
      </Box>
    </Flex>
    { loading ? 
      <>
        <Skeleton height="24px" />
      </>
      : null
    }
    { !error && !loading && data.storage ? 
      <>
        <Text>This storage is { prettyStorageType(data.storage!.type) }.</Text>
      </>
      : null
    }
    { !!error ?
      <Alert status="error" mt={ 4 }>
       <AlertIcon />
        Failed to fetch storage info. { error.message }
      </Alert>
      : null
    }
    { !error && !loading && !data.storage ? 
      <Alert status="error" mt={ 4 }>
       <AlertIcon />
        Storage not found.
      </Alert>
      : null
    }
    { !error && (data?.storage || loading) ?
      <>
        <Flex>
          <Text mt={ 4 } fontSize="xl">{ data?.storage ? `Files (${filter !== '' ? `${filterLength} / ${data.storage.backups.length}` : data.storage.backups.length})` : 'Files' }</Text>
          <Input disabled={ loading || !data?.storage || (data?.storage && data.storage.backups.length === 0) } ml="auto" my="auto" w="40%" size="sm" placeholder="Filter" value={ filter } onChange={ e => setFilter(e.target.value) } />
        </Flex>
        { ((data?.storage && data.storage.backups.length > 0) || loading) ?
          <SortableTable onItemClick={ (backup) => toggleChecked(backup.fileName) } isLoading={ loading } initialPath="stat.modified" filter={ filter } headers={
            [
              {
                title: '',
                clickable: false,
                render: (backup) => <Checkbox size="lg" isChecked={ checkedFiles.includes(backup.fileName) } onChange={ () => toggleChecked(backup.fileName) } ></Checkbox>,
              },
              {
                title: 'File',
                path: 'fileName',
                filterable: true,
              },
              {
                title: 'Size',
                path: 'stat.size',
                render: (backup) => formatBytes(backup.stat.size)
              },
              {
                title: 'Modified',
                path: 'stat.modified',
                reverse: true,
                render: (backup) => (
                  <Tooltip label={ dayjs(backup.stat.modified).format('YYYY-MM-DD hh:mm:ssa') }>
                    { dayjs(backup.stat.modified).fromNow() }
                  </Tooltip>
                )
              },
              {
                title: '',
                align: 'right',
                clickable: false,
                render: (backup) => (
                  <>
                    <Task onResult={ downloadFile }>
                      { ({ track, progress, complete, completeFlair, error }) => {
                        return <>
                          <Tooltip label={ error || '' }>
                            <Button size="sm" colorScheme={ error ? 'red' : 'green' } variant="ghost" onClick={ () => download(backup.fileName, track) } disabled={ !complete } style={{ opacity: 1 }}>
                              { complete ?
                                ( completeFlair ? <CheckIcon /> : <DownloadIcon />) :
                                <CircularProgress isIndeterminate={ progress == null } value={ progress * 100 } color="green.500" size="12px" thickness="10px" />
                              }
                              { status }
                            </Button>
                          </Tooltip>
                        </>
                      } }
                    </Task>
                    <ConfirmDelete name={ backup.fileName } onDelete={ async () => { await deleteBackup({ variables: { storage: name, fileName: backup.fileName } }); refetch() } }>
                      { (open) => (
                        <Button size="sm" colorScheme="red" variant="ghost" onClick={ open }>
                          <DeleteIcon />
                        </Button>
                      ) }
                    </ConfirmDelete>
                  </>
                ),
              },
            ] as SortableTableHeader<StorageBackup>[]
          } data={ data?.storage?.backups || [] } rightOfPagination={
            ( !!data?.storage ?
              <>
                <Button size="sm" mr={ 2 } onClick={ selectAll }>{ filter.length === 0 ? 'Select All' : 'Select Filtered' }</Button>
                <Button size="sm" mr={ 2 } onClick={ deselectAll }>{ filter.length === 0 ? 'Deselect All' : 'Deselect Filtered' }</Button>
                <Task onResult={ () => refetch() }>
                  { ({ complete, track, status, progress }) => (
                    <>
                    <ConfirmDelete name={ allFilesSelected ? 'ALL Files' : `${checkedFiles.length} File${checkedFiles.length === 1 ? '' : 's'}` } onDelete={ () => deleteMultiple(checkedFiles, track) }>
                      { (open) => (
                        <Button size="sm" colorScheme="red" rightIcon={ <DeleteIcon /> } disabled={ checkedFiles.length === 0 || !complete } onClick={ open } loadingText="Deleting" isLoading={ !complete }>Delete Selected ({ allFilesSelected ? 'ALL' : checkedFiles.length })</Button>
                      ) }
                    </ConfirmDelete>
                    <Modal isOpen={ !complete } onClose={ () => {} }>
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader>Deleting Files</ModalHeader>
                        <ModalBody mb={ 8 }>
                          { status }
                          <Progress mt={ 4 } isIndeterminate={ progress == null } value={ progress * 100 } colorScheme="red" />
                        </ModalBody>
                      </ModalContent>
                    </Modal>
                    </>
                  ) }
                </Task>
              </>
            : null )
          } />
          : null
        }
        { data?.storage && data.storage.backups.length === 0 ?
          <Text mt={ 2 } color="lightgray">No files found.</Text>
        : null }
      </>
      : null
    }
    <Box mt={ 8 }></Box>
  </Wrapper>;
}