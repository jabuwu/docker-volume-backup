import { Link, Text } from '@chakra-ui/layout';
import withApollo from '../apollo';
import { useVolumesQuery, useExportVolumeMutation, useAllStorageQuery } from '../generated/graphql';
import Wrapper from '../components/wrapper';
import Title from '../components/title';
import React, { useState, useRef } from 'react';
import { Alert, AlertIcon, Button, Skeleton, Spinner, Table, Tbody, Td, Th, Thead, Tr, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Select } from '@chakra-ui/react';
import NextLink from 'next/link';
import LoadingTr  from '../components/loading-tr';

function exportVolumeFn() {
  const [ open, setOpen ] = useState(false);
  const [ volume, setVolume ] = useState('');
  const [ exportVolume ] = useExportVolumeMutation();
  const { data: storageData, loading: storageLoading, error: storageError } = useAllStorageQuery();
  const [ storage, setStorage ] = useState('');
  const fileName = useRef<any>();

  function close() {
    setOpen(false);
  }

  function doExport() {
    exportVolume({
      variables: {
        volume,
        storage,
        fileName: fileName.current!.value || null,
      },
    });
  }

  return {
    open: (volume: string) => {
      setOpen(true);
      setVolume(volume);
    },
    jsx: <Modal size="xl" isOpen={ open } onClose={ close }>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Export { volume }</ModalHeader>
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
              <Input ref={ fileName } />
            </InputGroup>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={ 3 } onClick={ doExport } disabled={ !storageData || !storage }>
            Export
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  }
}

export default withApollo({ ssr: true })(function(): any {
  const { data, loading, error } = useVolumesQuery();
  let message: JSX.Element | null = null;
  let table: JSX.Element | null = null;
  const exportVolume = exportVolumeFn();
  if (loading) {
    table = <LoadingTr colSpan={ 3 } />
  } else if (error) {
    message = (
      <Alert status="error" mt={ 2 }>
        <AlertIcon />
        Failed to fetch volumes.
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
          <NextLink href={ `/volumes/${volume.name}` }>
            <Link fontWeight="bold">{ volume.name }</Link>
          </NextLink>
        </Td>
        <Td>
          <Text>local</Text>
        </Td>
        <Td>
          <Button colorScheme="blue" onClick={ () => exportVolume.open(volume.name) }>Export</Button>
        </Td>
      </Tr>
    ))}</>;
  }
  return (
    <Wrapper>
      <Title>Volumes</Title>
      <Text as="h1" fontSize="4xl">Volumes { loading ? <Spinner size="md" /> : null }</Text>
      { message }
      { table ? (<Table variant="striped">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Driver</Th>
            <Th>Operations</Th>
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