import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, Alert, AlertIcon, Select, ModalFooter, Button, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Box, Flex, Checkbox } from '@chakra-ui/react';
import React, { useState, useCallback, useEffect } from 'react';
import { useUpdateScheduleMutation, useVolumesQuery, useStorageListQuery, SchedulesQuery, SchedulesDocument, useScheduleLazyQuery } from '../generated/graphql';
import BackupIntervalInput from '../components/backup-interval-input';
import BackupNameInput from '../components/backup-name-input';

export default function EditScheduleModal({ children }: { children: (open: (id: string) => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ updateSchedule ] = useUpdateScheduleMutation();
  const [ getSchedule, { data, loading, error } ] = useScheduleLazyQuery();
  const { data: volumeData, loading: volumeLoading, error: volumeError } = useVolumesQuery({ fetchPolicy: 'network-only' });
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery({ fetchPolicy: 'network-only' });
  const [ id, setId ] = useState('');
  const [ storage, setStorage ] = useState('');
  const [ volume, setVolume ] = useState('');
  const [ fileNameFormat, setFileNameFormat ] = useState('');
  const [ hours, setHours ] = useState(1);
  const [ stopContainers, setStopContainers ] = useState(true);

  const open = useCallback((id: string) => {
    setIsOpen(true);
    setId(id);
    getSchedule({ variables: { id } });
      setStorage('');
      setVolume('');
      setFileNameFormat('');
      setHours(1);
      setStopContainers(true);
  }, []);

  useEffect(() => {
    if (data && data.schedule) {
      setStorage(data.schedule.storage);
      setVolume(data.schedule.volume);
      setFileNameFormat(data.schedule.fileNameFormat);
      setHours(data.schedule.hours);
      setStopContainers(data.schedule.stopContainers);
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
        stopContainers,
        fileNameFormat,
      },
    });
    close();
  }, [ storage, volume, hours, stopContainers, fileNameFormat ]);

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
              { volume && storage ?
                <>
                  <BackupNameInput value={ fileNameFormat } onChange={ value => setFileNameFormat(value) } dictionary={ { volumeName: volume } } />
                  <BackupIntervalInput value={ hours } onChange={ value => setHours(value) } />
                </>
              : null }
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Flex w="100%">
              <Box>
                <Checkbox isChecked={ stopContainers } onChange={ e => setStopContainers(e.target.checked) }>Stop Containers During Backup</Checkbox>
              </Box>
              <Box ml="auto">
                <Button colorScheme="blue" onClick={ update } disabled={ !volume || !storage || !!error }>
                  Update
                </Button>
              </Box>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}