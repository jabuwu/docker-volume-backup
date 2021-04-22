import { Link, Text } from '@chakra-ui/layout';
import withApollo from '../apollo';
import { useSchedulesQuery, useAllStorageQuery, useAddScheduleMutation, useVolumesQuery, useRemoveScheduleMutation } from '../generated/graphql';
import Wrapper from '../components/wrapper';
import Title from '../components/title';
import React, { useState, useRef } from 'react';
import { Alert, AlertIcon, Button, Skeleton, Spinner, Table, Tbody, Td, Th, Thead, Tr, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Select, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';
import NextLink from 'next/link';
import LoadingTr  from '../components/loading-tr';

function addScheduleModalFn() {
  const [ open, setOpen ] = useState(false);
  const [ addSchedule ] = useAddScheduleMutation();
  const { data: volumeData, loading: volumeLoading, error: volumeError } = useVolumesQuery();
  const { data: storageData, loading: storageLoading, error: storageError } = useAllStorageQuery();
  const [ storage, setStorage ] = useState('');
  const [ volume, setVolume ] = useState('');
  const hours = useRef<any>();

  function close() {
    setOpen(false);
  }

  function add() {
    addSchedule({
      variables: {
        storage,
        volume,
        hours: Number(hours.current!.value),
      }
    });
  }

  return {
    open: () => setOpen(true),
    jsx: <Modal size="xl" isOpen={ open } onClose={ close }>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Schedule</ModalHeader>
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
            { volumeError ? <>
              <Alert status="error">
                <AlertIcon />
                Failed to fetch volume information.
              </Alert>
            </> : null }
            { volumeLoading ? <>
              <Select placeholder="Loading Volumes..." disabled={ true }></Select>
            </> : null }
            { !!volumeData ? <>
              <Select placeholder="Select Volume" value={ volume } onChange={ e => setVolume(e.target.value) }>
                { volumeData.volumes.map(volume => (
                  <option key={ volume.name } value={ volume.name }>{ volume.name }</option>
                )) }
              </Select>
            </> : null }
            <NumberInput defaultValue={ 1 } min={ 1 }>
              <NumberInputField ref={ hours } />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" mr={ 3 } onClick={ add } disabled={ !volume || !storage }>
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  }
}

export default withApollo({ ssr: true })(function(): any {
  const { data, loading, error } = useSchedulesQuery();
  let message: JSX.Element | null = null;
  let table: JSX.Element | null = null;
  const addScheduleModal = addScheduleModalFn();
  const [ removeSchedule ] = useRemoveScheduleMutation();
  if (loading) {
    table = <LoadingTr colSpan={ 4 } />
  } else if (error) {
    message = (
      <Alert status="error" mt={ 2 }>
        <AlertIcon />
        Failed to fetch schedules.
      </Alert>
    );
  } else if (data.schedules.length === 0) {
    message = (
      <Text mt={ 2 }>No schedules found.</Text>
    );
  } else {
    table = <>{ data.schedules.map(schedule => (
      <Tr key={ schedule.id }>
        <Td>
          <Text>{ schedule.volume }</Text>
        </Td>
        <Td>
          <Text>{ schedule.storage }</Text>
        </Td>
        <Td>
          <Text>{ schedule.hours }</Text>
        </Td>
        <Td>
          <Button colorScheme="red" onClick={ () => removeSchedule({ variables: { id: schedule.id } }) }>Remove</Button>
        </Td>
      </Tr>
    ))}</>;
  }
  return (
    <Wrapper>
      <Title>Schedules</Title>
      <Flex mt={ 4 }>
        <Text as="h1" fontSize="4xl">Schedules { loading ? <Spinner size="md" /> : null }</Text>
        { (!loading && !error) ? <Button size="sm" ml="auto" mt="auto" colorScheme="green" onClick={ addScheduleModal.open }>Add Schedule</Button> : null }
      </Flex>
      { message }
      { table ? (<Table variant="striped">
        <Thead>
          <Tr>
            <Th>Volume</Th>
            <Th>Storage</Th>
            <Th>Hours</Th>
            <Th>Operations</Th>
          </Tr>
        </Thead>
        <Tbody>
          { table }
        </Tbody>
      </Table>) : null }
      { addScheduleModal.jsx }
    </Wrapper>
  )
});
