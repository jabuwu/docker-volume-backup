import { Link, Text } from '@chakra-ui/layout';
import { useVolumesQuery, useExportVolumeMutation, useImportVolumeMutation, useStorageListQuery, useStorageBackupsLazyQuery, usePinVolumeMutation } from '../generated/graphql';
import Wrapper from '../components/wrapper';
import Title from '../components/title';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Alert, AlertIcon, Button, Box, Skeleton, Spinner, Table, Tbody, Td, Th, Thead, Tr, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Select, Flex, RadioGroup, Radio } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import LoadingTr  from '../components/loading-tr';

function exportVolumeFn() {
  const [ open, setOpen ] = useState(false);
  const [ working, setWorking ] = useState(false);
  const [ volume, setVolume ] = useState('');
  const [ exportVolume ] = useExportVolumeMutation();
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery({ fetchPolicy: 'network-only' });
  const [ storage, setStorage ] = useState('');
  const [ fileName, setFileName ] = useState('');

  function close() {
    setOpen(false);
  }

  async function backup() {
    setWorking(true);
    await exportVolume({
      variables: {
        volume,
        storage,
        fileName,
      },
    });
    setWorking(false);
    setOpen(false);
  }

  return {
    open: (volume: string) => {
      setFileName(`${volume}-${Date.now()}.tgz`);
      setOpen(true);
      setVolume(volume);
    },
    jsx: <Modal size="xl" isOpen={ open } onClose={ close }>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Backup { volume }</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            { storageError ? <>
              <Alert status="error">
                <AlertIcon />
                Failed to fetch storage information.
              </Alert>
            </> : null }
            { storageLoading ? <>
              <Select placeholder="Loading Storage..." disabled={ true }></Select>
            </> : null }
            { !!storageData ? <>
              <Select placeholder="Select Storage" value={ storage } onChange={ e => setStorage(e.target.value) }>
                { storageData.allStorage.map(storage => (
                  <option key={ storage.name } value={ storage.name }>{ storage.name }</option>
                )) }
              </Select>
            </> : null }
            <InputGroup size="sm">
              <InputLeftAddon children="File Name" />
              <Input value={ fileName } onChange={ e => setFileName(e.target.value) } />
            </InputGroup>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={ backup } disabled={ !storageData || !storage } isLoading={ working }>
            Backup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  }
}

function importVolumeFn() {
  const [ open, setOpen ] = useState(false);
  const [ working, setWorking ] = useState(false);
  const [ volume, setVolume ] = useState('');
  const [ importVolume ] = useImportVolumeMutation();
  const [ getStorageBackups, { data: backupsData, loading: backupsLoading, error: backupsError } ] = useStorageBackupsLazyQuery({ fetchPolicy: 'network-only' });
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery({ fetchPolicy: 'network-only' });
  const [ storage, setStorage ] = useState('');
  const [ filter, setFilter ] = useState('');
  const [ fileName, setFileName ] = useState('');

  useEffect(() => {
    if (storage) {
      setFileName('');
      getStorageBackups({ variables: { name: storage } });
    }
  }, [ storage ]);
  useEffect(() => {
    setFileName('');
  }, [ filter ]);

  function close() {
    setOpen(false);
  }

  async function backup() {
    setWorking(true);
    await importVolume({
      variables: {
        volume,
        fileName,
        storage
      },
    });
    setWorking(false);
    setOpen(false);
  }

  return {
    open: (volume: string) => {
      setStorage('');
      setFileName('');
      setFilter(`${volume}-`);
      setOpen(true);
      setVolume(volume);
    },
    jsx: <Modal size="xl" isOpen={ open } onClose={ close }>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Restore { volume }</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            { storageError ? <>
              <Alert status="error">
                <AlertIcon />
                Failed to fetch storage information.
              </Alert>
            </> : null }
            { storageLoading ? <>
              <Select placeholder="Loading Storage..." disabled={ true }></Select>
            </> : null }
            { !!storageData ? <>
              <Select placeholder="Select Storage" value={ storage } onChange={ e => setStorage(e.target.value) }>
                { storageData.allStorage.map(storage => (
                  <option key={ storage.name } value={ storage.name }>{ storage.name }</option>
                )) }
              </Select>
            </> : null }
            { storage && !!backupsData && !!backupsData.storage ?
              <>
                <InputGroup size="sm">
                  <InputLeftAddon children="Filter" />
                  <Input value={ filter } onChange={ e => setFilter(e.target.value) } />
                </InputGroup>
                <RadioGroup defaultValue="1" value={ fileName } onChange={ value => setFileName(value) }>
                  <Stack>
                    { backupsData.storage!.backups.filter(backup => backup.fileName.startsWith(filter)).map(backup => (
                      <Radio key={ backup.fileName } value={ backup.fileName }>{ backup.fileName}</Radio>
                    )) }
                    { backupsData.storage!.backups.filter(backup => backup.fileName.startsWith(filter)).length === 0 ?
                      <Text>{ !!filter ? 'No files found matching the filter.' : 'No files found.' }</Text>
                    : null }
                  </Stack>
                </RadioGroup>
              </>
            : null }
            { storage && !backupsData ?
              <Box textAlign="center" mt={ 4 }>
                <Spinner size="xl" />
              </Box>
            : null }
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="orange" onClick={ backup } disabled={ !storageData || !storage || !fileName } isLoading={ working }>
            Restore
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  }
}

export default function Index(): any {
  const { data, loading, error, refetch } = useVolumesQuery({ fetchPolicy: 'network-only', notifyOnNetworkStatusChange: true });
  const [ pinVolume ] = usePinVolumeMutation();
  let message: JSX.Element | null = null;
  let table: JSX.Element | null = null;
  const exportVolume = exportVolumeFn();
  const importVolume = importVolumeFn();
  if (loading) {
    table = <LoadingTr colSpan={ 3 } />
  } else if (error) {
    message = (
      <Alert status="error" mt={ 2 }>
        <AlertIcon />
        Failed to fetch volumes. { error.message }
      </Alert>
    );
  } else if (data.volumes.length === 0) {
    message = (
      <Text mt={ 2 }>No volumes found.</Text>
    );
  } else {
    table = <>{ data.volumes.map(volume => (
      <Tr key={ volume.name }>
        <Td>
          <Flex>
            <Button size="sm" variant="ghost" colorScheme={ volume.pinned ? 'yellow' : 'blue' } onClick={ async () => { await pinVolume({ variables: { volume: volume.name, pinned: !volume.pinned } }); refetch() } }>
              <StarIcon />
            </Button>
            <Text ml={ 2 } my="auto" fontWeight="bold">{ volume.name }</Text>
          </Flex>
        </Td>
        <Td>
          <Text>{ volume.driver }</Text>
        </Td>
        <Td textAlign="right">
          <Button colorScheme="blue" onClick={ () => exportVolume.open(volume.name) }>Backup</Button>
          <Button colorScheme="orange" ml={ 2 } onClick={ () => importVolume.open(volume.name) }>Restore</Button>
        </Td>
      </Tr>
    ))}</>;
  }
  return (
    <Wrapper>
      <Title>Volumes</Title>
      <Flex mt={ 4 }>
        <Text as="h1" fontSize="4xl">Volumes { loading ? <Spinner size="md" /> : null }</Text>
        <Box ml="auto" mt="auto">
          <Button size="sm" ml={ 2 } colorScheme="green" onClick={ () => refetch() } isLoading={ loading }>Refresh</Button>
        </Box>
      </Flex>
      { message }
      { table ? (<Table variant="striped">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Driver</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          { table }
        </Tbody>
      </Table>) : null }
      { exportVolume.jsx }
      { importVolume.jsx }
    </Wrapper>
  )
}