import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, Alert, AlertIcon, Select, InputGroup, InputLeftAddon, Input, ModalFooter, Button, Box, Radio, RadioGroup, Spinner, Text, Progress, Checkbox, Flex } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import { useImportVolumeMutation, useStorageListQuery, useStorageBackupsLazyQuery, useTaskUpdatedSubscription } from '../generated/graphql';

export default function RestoreVolumeModal({ children }: { children: (open: (volume: string) => void) => void }) {
  const [ isOpen, setIsOpen ] = React.useState(false);
  const [ working, setWorking ] = useState(false);
  const [ importVolume ] = useImportVolumeMutation();
  const [ getStorageBackups, { data: backupsData, loading: backupsLoading, error: backupsError } ] = useStorageBackupsLazyQuery({ fetchPolicy: 'network-only' });
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery();
  const [ stopContainers, setStopContainers ] = useState(true);
  const [ storage, setStorage ] = useState('');
  const [ filter, setFilter ] = useState('');
  const [ fileName, setFileName ] = useState('');
  const [ volume, setVolume ] = useState('');
  const [ taskId, setTaskId ] = useState('');
  const [ status, setStatus ] = useState('');
  const [ progress, setProgress ] = useState(undefined as undefined | number);
  const [ progressError, setProgressError ] = useState(undefined as undefined | string);
  useTaskUpdatedSubscription({
    variables: {
      id: taskId,
    },
    skip: taskId === '',
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data?.taskUpdated) {
        const data = subscriptionData?.data?.taskUpdated;
        if (data.done) {
          setTaskId('');
          if (data.error) {
            setProgressError(data.error);
          } else {
            setWorking(false);
            close();
          }
        } else {
          setStatus(data.status);
          setProgress(data.progress);
        }
      }
    },
  });

  const open = useCallback((volume: string) => {
    setIsOpen(true);
    setStopContainers(true);
    setStorage('');
    setFilter(`${volume}--`);
    setVolume(volume);
    setTaskId('');
    setStatus('');
    setWorking(false);
    setProgress(undefined);
    setProgressError(undefined);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (storage) {
      setFileName('');
      getStorageBackups({ variables: { name: storage } });
    }
  }, [ storage ]);

  useEffect(() => {
    setFileName('');
  }, [ filter ]);

  const restore = useCallback(async () => {
    setWorking(true);
    // TODO: this can throw, catch error
    const { data } = await importVolume({
      variables: {
        volume,
        fileName,
        storage,
        stopContainers,
      },
    });
    // TODO: error if null?
    if (data?.importVolume) {
      setTaskId(data?.importVolume);
    }
  }, [ volume, fileName, storage ]);

  return (
    <>
      { children(open) }
      <Modal size="xl" isOpen={ isOpen } onClose={ close }>
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
              { !working && storageLoading ? <>
                <Select placeholder="Loading Storage..." disabled={ true }></Select>
              </> : null }
              { !working && !!storageData ? <>
                <Select placeholder="Select Storage" value={ storage } onChange={ e => setStorage(e.target.value) }>
                  { storageData.allStorage.map(storage => (
                    <option key={ storage.name } value={ storage.name }>{ storage.name }</option>
                  )) }
                </Select>
              </> : null }
              { !working && storage && !!backupsData && !!backupsData.storage ?
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
              { working && !progressError ?
                <>
                  <Text>{ status }</Text>
                  <Progress value={ progress * 100 } isIndeterminate={ progress == null } />
                </>
              : null }
              { working && progressError ?
                <Alert status="error">
                  <AlertIcon />
                  Failed to restore volume. { progressError }
                </Alert>
              : null }
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Flex w="100%">
              { !working ?
                <Box>
                  <Checkbox isChecked={ stopContainers } onChange={ e => setStopContainers(e.target.checked) }>Stop Containers During Restore</Checkbox>
                </Box>
              : null}
              <Box ml="auto">
                { !progressError ?
                  <Button colorScheme="orange" onClick={ restore } disabled={ !storageData || !storage || !fileName || working } isLoading={ working }>
                    Restore
                  </Button>
                : null }
                { progressError ?
                  <Button colorScheme="red" onClick={ close }>
                    Close
                  </Button>
                : null }
              </Box>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}