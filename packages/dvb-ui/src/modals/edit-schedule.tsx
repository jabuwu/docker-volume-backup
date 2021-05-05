import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, Alert, AlertIcon, Select, ModalFooter, Button, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Box, Flex, Checkbox } from '@chakra-ui/react';
import React, { useState, useCallback, useEffect } from 'react';
import { useUpdateScheduleMutation, useVolumesQuery, useStorageListQuery, SchedulesQuery, SchedulesDocument, useScheduleLazyQuery, BackupFrequency } from '../generated/graphql';
import BackupFrequencyInput from '../components/backup-frequency-input';
import BackupNameInput from '../components/backup-name-input';
import { findIndex } from 'lodash';

export default function EditScheduleModal({ children }: { children: (open: (id: string) => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ updateSchedule ] = useUpdateScheduleMutation();
  const [ getSchedule, { data, loading, error } ] = useScheduleLazyQuery();
  const { data: volumeData, loading: volumeLoading, error: volumeError } = useVolumesQuery({ fetchPolicy: 'network-only' });
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery({ fetchPolicy: 'network-only' });
  const [ id, setId ] = useState('');
  const [ storage, setStorage ] = useState('');
  const [ volumeName, setVolumeName ] = useState('');
  const [ volumeSafeName, setVolumeSafeName ] = useState('');
  const [ fileNameFormat, setFileNameFormat ] = useState('');
  const [ stopContainers, setStopContainers ] = useState(true);
  const [ frequencies, setFrequencies ] = useState([] as BackupFrequency[])

  const open = useCallback((id: string) => {
    setIsOpen(true);
    setId(id);
    getSchedule({ variables: { id } });
    setStorage('');
    setVolumeName('');
    setVolumeSafeName('');
    setFileNameFormat('');
    setStopContainers(true);
    setFrequencies([]);
  }, []);

  useEffect(() => {
    if (data && data.schedule) {
      setStorage(data.schedule.storage);
      setVolumeName(data.schedule.volume);
      setFileNameFormat(data.schedule.fileNameFormat);
      setStopContainers(data.schedule.stopContainers);
      setFrequencies(data.schedule.frequencies);
    }
  }, [ isOpen, data ]);

  useEffect(() => {
    if (volumeData?.volumes) {
      const index = findIndex(volumeData?.volumes, { name: volumeName });
      if (index !== -1) {
        setVolumeSafeName(volumeData?.volumes[index].safeName);
      } else {
        setVolumeSafeName(volumeName);
      }
    } else {
      setVolumeSafeName(volumeName);
    }
  }, [ volumeName ]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const update = useCallback(async () => {
    await updateSchedule({
      variables: {
        id,
        storage,
        volume: volumeName,
        stopContainers,
        fileNameFormat,
        frequencies,
      },
    });
    close();
  }, [ storage, volumeName, stopContainers, fileNameFormat, frequencies ]);

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
                <Select placeholder="Select Volume" value={ volumeName } onChange={ e => setVolumeName(e.target.value) } disabled={ !!loading || !!error }>
                  { volumeData.volumes.map(volume => (
                    <option key={ volume.name } value={ volume.name }>{ volume.name }</option>
                  )) }
                </Select>
              </> : null }
              { volumeName && storage ?
                <>
                  <BackupNameInput value={ fileNameFormat } onChange={ value => setFileNameFormat(value) } dictionary={ { volumeName: volumeSafeName } } />
                  <BackupFrequencyInput value={ frequencies } onChange={ value => setFrequencies(value) } />
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
                <Button colorScheme="blue" onClick={ update } disabled={ !volumeName || !storage || !!error }>
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