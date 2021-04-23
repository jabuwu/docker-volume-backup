import { Link, Text } from '@chakra-ui/layout';
import withApollo from '../apollo';
import { useVolumesQuery, useExportVolumeMutation, useAllStorageQuery } from '../generated/graphql';
import Wrapper from '../components/wrapper';
import Title from '../components/title';
import React, { useState, useRef, useMemo } from 'react';
import { Alert, AlertIcon, Button, Box, Skeleton, Spinner, Table, Tbody, Td, Th, Thead, Tr, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Select, Flex } from '@chakra-ui/react';
import NextLink from 'next/link';
import LoadingTr  from '../components/loading-tr';

function exportVolumeFn() {
  const [ open, setOpen ] = useState(false);
  const [ working, setWorking ] = useState(false);
  const [ volume, setVolume ] = useState('');
  const [ exportVolume ] = useExportVolumeMutation();
  const { data: storageData, loading: storageLoading, error: storageError } = useAllStorageQuery({ fetchPolicy: 'network-only' });
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
          <Button colorScheme="blue" mr={ 3 } onClick={ backup } disabled={ !storageData || !storage } isLoading={ working }>
            Backup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  }
}

export default withApollo({ ssr: true })(function(): any {
  const { data, loading, error, refetch } = useVolumesQuery({ fetchPolicy: 'network-only', notifyOnNetworkStatusChange: true });
  let message: JSX.Element | null = null;
  let table: JSX.Element | null = null;
  const exportVolume = exportVolumeFn();
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
          <Text fontWeight="bold">{ volume.name }</Text>
        </Td>
        <Td>
          <Text>{ volume.driver }</Text>
        </Td>
        <Td textAlign="right">
          <Button colorScheme="blue" onClick={ () => exportVolume.open(volume.name) }>Backup</Button>
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
    </Wrapper>
  )
});