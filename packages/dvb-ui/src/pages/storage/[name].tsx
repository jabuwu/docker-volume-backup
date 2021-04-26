import Wrapper from '../../components/wrapper';
import { useStorageQuery, useDeleteBackupMutation, useDownloadBackupMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import { Text, Skeleton, AlertIcon, Alert, Table, Tbody, Th, Thead, Tr, Td, Button, Box, Flex, useToast, Tooltip } from '@chakra-ui/react';
import Title from '../../components/title';
import React, { useCallback, useState } from 'react';
import LoadingTr from '../../components/loading-tr';
import { DeleteIcon, DownloadIcon, RepeatIcon } from '@chakra-ui/icons';
import ConfirmDelete from '../../modals/confirm-delete';
import dayjs from 'dayjs';

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;
const TB = GB * 1024;
const PB = TB * 1024;
function formatSize(size: number) {
  if (size > PB) {
    return `${(size / PB).toFixed(2)}PB`;
  } else if (size > TB) {
    return `${(size / TB).toFixed(2)}TB`;
  } else if (size > GB) {
    return `${(size / GB).toFixed(2)}GB`;
  } else if (size > MB) {
    return `${(size / MB).toFixed(2)}MB`;
  } else if (size > KB) {
    return `${(size / KB).toFixed(2)}KB`;
  } else {
    return `${size} Bytes`;
  }
}

export default function Storage(): any {
  const router = useRouter();
  const name = router.query.name as string;
  const [ deleteBackup ] = useDeleteBackupMutation();
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
  const [ downloadingFiles, setDownloadingFiles ] = useState([] as string[]);
  const download = useCallback(async (fileName: string) => {
    const storage = name;
    setDownloadingFiles(arr => ([ ...arr, fileName ]));
    const result = await downloadBackup({
      variables: {
        storage,
        fileName,
      },
    });
    setDownloadingFiles(arr => arr.filter(item => item !== fileName));
    if (result.data.downloadBackup) {
      (document as any).location = `${process.env.NEXT_PUBLIC_API || 'http://localhost:1998/api'}${result.data.downloadBackup}`;
    } else {
      toast({
        title: 'Failed to download backup file.',
        description: `${storage}/${fileName}`,
        status: 'error',
      });
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
        <Text>{ data.storage!.type }</Text>
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
        <Text mt={ 4 } fontSize="xl">Files</Text>
        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th>File</Th>
              <Th>Size</Th>
              <Th>Modified</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            { loading ? <LoadingTr colSpan={ 4 } /> : null }
            { !loading && data?.storage ?
              data.storage.backups.map(backup => (
                <Tr key={ backup.fileName }>
                  <Td>{ backup.fileName }</Td>
                  <Td>{ formatSize(backup.stat.size) }</Td>
                  <Td>
                    <Tooltip label={ dayjs(backup.stat.modified).format('YYYY-MM-DD hh:mm:ssa') } openDelay={ 500 }>
                      <Text>
                        { dayjs(backup.stat.modified).fromNow() }
                      </Text>
                    </Tooltip>
                  </Td>
                  <Td textAlign="right">
                    <Button size="sm" colorScheme="green" variant="ghost" onClick={ () => download(backup.fileName) } isLoading={ downloadingFiles.includes(backup.fileName) }>
                      <DownloadIcon />
                    </Button>
                    <ConfirmDelete name={ backup.fileName } onDelete={ async () => { await deleteBackup({ variables: { storage: name, fileName: backup.fileName } }); refetch() } }>
                      { (open) => (
                        <Button size="sm" colorScheme="red" variant="ghost" onClick={ open }>
                          <DeleteIcon />
                        </Button>
                      ) }
                    </ConfirmDelete>
                  </Td>
                </Tr>
              ))
              : null
            }
          </Tbody>
        </Table>
      </>
      : null
    }
    <Box mt={ 8 }></Box>
  </Wrapper>;
}