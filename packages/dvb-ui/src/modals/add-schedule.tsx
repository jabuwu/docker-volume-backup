import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, Alert, AlertIcon, Select, ModalFooter, Button, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Box, Checkbox, Flex } from '@chakra-ui/react';
import React, { useState, useRef, useCallback } from 'react';
import { useAddScheduleMutation, useVolumesQuery, useStorageListQuery, SchedulesQuery, SchedulesDocument } from '../generated/graphql';
import BackupIntervalInput from '../components/backup-interval-input';
import BackupNameInput from '../components/backup-name-input';

const defaultFileNameFormat = '${volumeName}--${dateNow}.tgz';

export default function AddScheduleModal({ children }: { children: (open: () => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ addSchedule ] = useAddScheduleMutation();
  const { data: volumeData, loading: volumeLoading, error: volumeError } = useVolumesQuery({ fetchPolicy: 'network-only' });
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery({ fetchPolicy: 'network-only' });
  const [ storage, setStorage ] = useState('');
  const [ volume, setVolume ] = useState('');
  const [ fileNameFormat, setFileNameFormat ] = useState(defaultFileNameFormat);
  const [ hours, setHours ] = useState(24);
  const [ stopContainers, setStopContainers ] = useState(true);

  const open = useCallback(() => {
    setIsOpen(true);
    setStorage('');
    setVolume('');
    setFileNameFormat(defaultFileNameFormat);
    setHours(24);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const add = useCallback(async () => {
    await addSchedule({
      variables: {
        storage,
        volume,
        hours,
        stopContainers,
        fileNameFormat,
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
  }, [ storage, volume, hours, stopContainers, fileNameFormat ]);

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
                <Select placeholder="Select Volume" value={ volume } onChange={ e => setVolume(e.target.value) }>
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
                <Button colorScheme="green" onClick={ add } disabled={ !volume || !storage }>
                  Add
                </Button>
              </Box>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}