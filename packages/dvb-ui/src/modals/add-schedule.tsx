import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, Alert, AlertIcon, Select, ModalFooter, Button, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Box, Checkbox, Flex } from '@chakra-ui/react';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAddScheduleMutation, useVolumesQuery, useStorageListQuery, SchedulesQuery, SchedulesDocument, BackupFrequency } from '../generated/graphql';
import BackupFrequencyInput from '../components/backup-frequency-input';
import BackupNameInput from '../components/backup-name-input';
import { findIndex } from 'lodash';

const defaultFileNameFormat = '${volumeName}--${dateNow}.tgz';
const defaultFrequencies: BackupFrequency[] = [
  {
    interval: {
      unit: 'hours',
      interval: 24,
    },
  }
];

export default function AddScheduleModal({ children }: { children: (open: () => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ addSchedule ] = useAddScheduleMutation();
  const { data: volumeData, loading: volumeLoading, error: volumeError } = useVolumesQuery({ fetchPolicy: 'network-only' });
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery({ fetchPolicy: 'network-only' });
  const [ storage, setStorage ] = useState('');
  const [ volumeName, setVolumeName ] = useState('');
  const [ volumeSafeName, setVolumeSafeName ] = useState('');
  const [ fileNameFormat, setFileNameFormat ] = useState(defaultFileNameFormat);
  const [ stopContainers, setStopContainers ] = useState(true);
  const [ frequencies, setFrequencies ] = useState(defaultFrequencies);

  const open = useCallback(() => {
    setIsOpen(true);
    setStorage('');
    setVolumeName('');
    setVolumeSafeName('');
    setFileNameFormat(defaultFileNameFormat);
    setStopContainers(true);
    setFrequencies(defaultFrequencies);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

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

  const add = useCallback(async () => {
    await addSchedule({
      variables: {
        storage,
        volume: volumeName,
        stopContainers,
        fileNameFormat,
        frequencies,
      },
      update: (cache, { data }) => {
        if (data.addSchedule) {
          const queryData = Object.assign({}, cache.readQuery<SchedulesQuery>({ query: SchedulesDocument }));
          if (!queryData.schedules.find(item => item.id === data.addSchedule!.id)) {
            queryData.schedules = [...queryData.schedules, data.addSchedule];
          }
          cache.writeQuery({ query: SchedulesDocument, data: queryData });
        }
      }
    });
    close();
  }, [ storage, volumeName, stopContainers, fileNameFormat, frequencies ]);

  return (
    <>
      { children(open) }
      <Modal size="xl" isOpen={ isOpen } onClose={ close }>
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
                <Select placeholder="Select Volume" value={ volumeName } onChange={ e => setVolumeName(e.target.value) }>
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
            { !!volumeName && !!storage ?
              <Flex w="100%">
                <Box>
                  <Checkbox isChecked={ stopContainers } onChange={ e => setStopContainers(e.target.checked) }>Stop Containers During Backup</Checkbox>
                </Box>
                <Box ml="auto">
                  <Button colorScheme="green" onClick={ add }>
                    Add
                  </Button>
                </Box>
              </Flex>
            : null}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}