import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Button, Alert, AlertIcon, Checkbox, InputRightElement, NumberInput, NumberInputField } from '@chakra-ui/react';
import React, { useState, useCallback, useEffect } from 'react';
import { useLocalFileSystemLazyQuery, useUpdateLocalFileSystemMutation } from '../generated/graphql';

export default function EditS3BucketModal({ children }: { children: (open: (name: string) => void) => any }) {
  const [ isOpen, setIsOpen ] = useState(false)
  const [ updateLocalFileSystem ] = useUpdateLocalFileSystemMutation();
  const [ getLocalFileSystem, { data, loading, error } ] = useLocalFileSystemLazyQuery();
  const [ name, setName ] = useState('');
  const [ path, setPath ] = useState('');
  const [ prefix, setPrefix ] = useState('');

  const open = useCallback((name: string) => {
    setName(name);
    setIsOpen(true);
    getLocalFileSystem({ variables: { name } });
    setPath('');
    setPrefix('');
  }, []);

  useEffect(() => {
    if (data && data.storage && data.storage.localFileSystem) {
      setPath(data.storage!.localFileSystem!.path);
      setPrefix(data.storage!.localFileSystem!.prefix);
    }
  }, [ isOpen, data ]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const update = useCallback(async () => {
    await updateLocalFileSystem({
      variables: {
        name,
        path,
        prefix,
      }
    });
    close();
  }, [ name, path, prefix ]);

  return (
    <>
      { children(open) }
      <Modal size="xl" isOpen={ isOpen } onClose={ close }>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit { name }</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            { !!error ? <Alert status="error" mb={ 4 }>
                <AlertIcon />
                { error.message }
              </Alert>
              : null
            }
            <Stack spacing={4}>
              <InputGroup size="sm">
                <InputLeftAddon children="Path" />
                <Input value={ path } onChange={ e => setPath(e.target.value) } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Prefix" />
                <Input value={ prefix } onChange={ e => setPrefix(e.target.value) } />
              </InputGroup>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={ update } isLoading={ loading } disabled={ !!error || !name }>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}