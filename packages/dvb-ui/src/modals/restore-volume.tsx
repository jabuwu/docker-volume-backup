import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, Alert, AlertIcon, Select, InputGroup, InputLeftAddon, Input, ModalFooter, Button, Box, Radio, RadioGroup, Spinner, Text } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import { useImportVolumeMutation, useStorageListQuery, useStorageBackupsLazyQuery } from '../generated/graphql';

export default function RestoreVolumeModal({ volume, onClose }: { volume: string | null, onClose: () => void }) {
  const [ working, setWorking ] = useState(false);
  const [ importVolume ] = useImportVolumeMutation();
  const [ getStorageBackups, { data: backupsData, loading: backupsLoading, error: backupsError } ] = useStorageBackupsLazyQuery({ fetchPolicy: 'network-only' });
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery({ fetchPolicy: 'network-only' });
  const [ storage, setStorage ] = useState('');
  const [ filter, setFilter ] = useState('');
  const [ fileName, setFileName ] = useState('');

  useEffect(() => {
    if (storage) {
      setFileName('');
      getStorageBackups({ variables: { name: storage } });
    }
  }, [ storage ]);

  useEffect(() => {
    setFileName('');
  }, [ filter ]);

  useEffect(() => {
    setStorage('');
    setFileName('');
    setFilter(`${volume}-`);
  }, [ volume ]);

  const restore = useCallback(async () => {
    setWorking(true);
    await importVolume({
      variables: {
        volume,
        fileName,
        storage
      },
    });
    setWorking(false);
    onClose();
  }, [ volume, fileName, storage ]);

  return (
    <Modal size="xl" isOpen={ volume != null } onClose={ onClose }>
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
            { storage && !!backupsData && !!backupsData.storage ?
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
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="orange" onClick={ restore } disabled={ !storageData || !storage || !fileName } isLoading={ working }>
            Restore
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}