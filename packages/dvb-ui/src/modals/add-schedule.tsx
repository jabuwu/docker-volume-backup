import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, Alert, AlertIcon, Select, ModalFooter, Button, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from '@chakra-ui/react';
import React, { useState, useRef, useCallback } from 'react';
import { useAddScheduleMutation, useVolumesQuery, useStorageListQuery } from '../generated/graphql';

export default function AddScheduleModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: () => void }) {
  const [ addSchedule ] = useAddScheduleMutation();
  const { data: volumeData, loading: volumeLoading, error: volumeError } = useVolumesQuery({ fetchPolicy: 'network-only' });
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery({ fetchPolicy: 'network-only' });
  const [ storage, setStorage ] = useState('');
  const [ volume, setVolume ] = useState('');
  const hours = useRef<any>();

  const add = useCallback(async () => {
    await addSchedule({
      variables: {
        storage,
        volume,
        hours: Number(hours.current!.value),
      }
    });
    onAdd();
    onClose();
  }, [ storage, volume, hours ]);

  return (
    <Modal size="xl" isOpen={ isOpen } onClose={ onClose }>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Schedule</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            { storageError ? <>
              <Alert status="error">
                <AlertIcon />
                Failed to fetch storage information. { storageError.message }
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
                Failed to fetch volume information. { volumeError.message }
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
          <Button colorScheme="green" onClick={ add } disabled={ !volume || !storage }>
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}