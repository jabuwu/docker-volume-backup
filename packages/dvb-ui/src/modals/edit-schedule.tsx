import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, Alert, AlertIcon, Select, ModalFooter, Button, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from '@chakra-ui/react';
import React, { useState, useCallback, useEffect } from 'react';
import { useUpdateScheduleMutation, useVolumesQuery, useStorageListQuery, SchedulesQuery, SchedulesDocument, useScheduleLazyQuery } from '../generated/graphql';

export default function EditScheduleModal({ children }: { children: (open: (id: string) => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ updateSchedule ] = useUpdateScheduleMutation();
  const [ getSchedule, { data, loading, error } ] = useScheduleLazyQuery();
  const { data: volumeData, loading: volumeLoading, error: volumeError } = useVolumesQuery({ fetchPolicy: 'network-only' });
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery({ fetchPolicy: 'network-only' });
  const [ id, setId ] = useState('');
  const [ storage, setStorage ] = useState('');
  const [ volume, setVolume ] = useState('');
  const [ hours, setHours ] = useState(1);

  const open = useCallback((id: string) => {
    setIsOpen(true);
    setId(id);
    getSchedule({ variables: { id } });
      setStorage('');
      setVolume('');
      setHours(1);
  }, []);

  useEffect(() => {
    if (data && data.schedule) {
      setStorage(data.schedule.storage);
      setVolume(data.schedule.volume);
      setHours(data.schedule.hours);
    }
  }, [ isOpen, data ]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const update = useCallback(async () => {
    await updateSchedule({
      variables: {
        id,
        storage,
        volume,
        hours,
      },
    });
    close();
  }, [ storage, volume, hours ]);

  return (
    <>
      { children(open) }
      <Modal size="xl" isOpen={ isOpen } onClose={ close }>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Schedule</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            { !!error ? <Alert status="error" mb={ 4 }>
                <AlertIcon />
                { error.message }
              </Alert>
              : null
            }
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
                <Select placeholder="Select Storage" value={ storage } onChange={ e => setStorage(e.target.value) } disabled={ !!loading || !!error }>
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
                <Select placeholder="Select Volume" value={ volume } onChange={ e => setVolume(e.target.value) } disabled={ !!loading || !!error }>
                  { volumeData.volumes.map(volume => (
                    <option key={ volume.name } value={ volume.name }>{ volume.name }</option>
                  )) }
                </Select>
              </> : null }
              <NumberInput min={ 1 } value={ hours } onChange={ value => setHours(Number(value)) } disabled={ !!loading || !!error }>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={ update } disabled={ !volume || !storage || !!error }>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}