import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, Alert, AlertIcon, Select, InputGroup, InputLeftAddon, Input, ModalFooter, Button } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import { useExportVolumeMutation, useStorageListQuery } from '../generated/graphql';

export default function BackupVolumeModal({ volume, onClose }: { volume: string | null, onClose: () => void }) {
  const [ working, setWorking ] = useState(false);
  const [ exportVolume ] = useExportVolumeMutation();
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery();
  const [ storage, setStorage ] = useState('');
  const [ fileName, setFileName ] = useState('');

  useEffect(() => {
    if (volume != null) {
      setFileName(`${volume}-${Date.now()}.tgz`);
    }
  }, [ volume ]);

  const backup = useCallback(async () => {
    setWorking(true);
    await exportVolume({
      variables: {
        volume,
        storage,
        fileName,
      },
    });
    setWorking(false);
    onClose();
  }, [ volume, storage, fileName ]);

  return (
    <Modal size="xl" isOpen={ volume != null } onClose={ onClose }>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Backup { volume }</ModalHeader>
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
            <InputGroup size="sm">
              <InputLeftAddon children="File Name" />
              <Input value={ fileName } onChange={ e => setFileName(e.target.value) } />
            </InputGroup>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={ backup } disabled={ !storageData || !storage } isLoading={ working }>
            Backup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}