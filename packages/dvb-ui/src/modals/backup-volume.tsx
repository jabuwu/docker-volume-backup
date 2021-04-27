import { Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, Alert, AlertIcon, Select, InputGroup, InputLeftAddon, Input, ModalFooter, Button, Progress } from '@chakra-ui/react';
import React, { useState, useCallback } from 'react';
import { useExportVolumeMutation, useStorageListQuery, useTaskUpdatedSubscription } from '../generated/graphql';

export default function BackupVolumeModal({ children }: { children: (open: (volume: string) => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false);
  const [ volume, setVolume ] = React.useState('');
  const [ working, setWorking ] = useState(false);
  const [ exportVolume ] = useExportVolumeMutation();
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery();
  const [ storage, setStorage ] = useState('');
  const [ fileName, setFileName ] = useState('');
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
    setFileName(`${volume}-${Date.now()}.tgz`);
    setVolume(volume);
    setTaskId('');
    setStatus('');
    setWorking(false);
    setProgress(undefined);
    setProgressError('');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const backup = useCallback(async () => {
    setWorking(true);
    // TODO: this can throw, catch error
    const { data } = await exportVolume({
      variables: {
        volume,
        storage,
        fileName,
      },
    });
    // TODO: error if null?
    if (data?.exportVolume) {
      setTaskId(data?.exportVolume);
    }
  }, [ volume, storage, fileName ]);

  return (
    <>
      { children(open) }
      <Modal size="xl" isOpen={ isOpen } onClose={ close }>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Backup { volume }</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={ 4 }>
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
                <Select placeholder="Select Storage" value={ storage } onChange={ e => setStorage(e.target.value) } disabled={ working }>
                  { storageData.allStorage.map(storage => (
                    <option key={ storage.name } value={ storage.name }>{ storage.name }</option>
                  )) }
                </Select>
              </> : null }
              { ! working ? <InputGroup size="sm">
                  <InputLeftAddon children="File Name" />
                  <Input value={ fileName } onChange={ e => setFileName(e.target.value) } disabled={ working } />
                </InputGroup>
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
                  Failed to backup volume. { progressError }
                </Alert>
              : null }
            </Stack>
          </ModalBody>
          <ModalFooter>
            { !progressError ?
              <Button colorScheme="blue" onClick={ backup } disabled={ !storageData || !storage || working } isLoading={ working }>
                Backup
              </Button>
            : null }
            { progressError ?
              <Button colorScheme="red" onClick={ close }>
                Close
              </Button>
            : null }
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}