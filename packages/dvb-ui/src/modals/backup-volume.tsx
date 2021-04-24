import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, Alert, AlertIcon, Select, InputGroup, InputLeftAddon, Input, ModalFooter, Button } from '@chakra-ui/react';
import React, { useState, useCallback } from 'react';
import { useExportVolumeMutation, useStorageListQuery } from '../generated/graphql';

export default function BackupVolumeModal({ children }: { children: (open: (volume: string) => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false);
  const [ volume, setVolume ] = React.useState('');
  const [ working, setWorking ] = useState(false);
  const [ exportVolume ] = useExportVolumeMutation();
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageListQuery();
  const [ storage, setStorage ] = useState('');
  const [ fileName, setFileName ] = useState('');

  const open = useCallback((volume: string) => {
    setIsOpen(true);
    setFileName(`${volume}-${Date.now()}.tgz`);
    setVolume(volume);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

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
    close();
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
    </>
  );
}