import { InfoIcon } from '@chakra-ui/icons';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Button, Text, Collapse, Link, Box, Code, Flex, Alert, AlertIcon, InputRightElement, NumberInput, NumberInputField, Checkbox } from '@chakra-ui/react';
import React, { useRef, useCallback, useState } from 'react';
import { AllStorageDocument, AllStorageQuery, useAddLocalFileSystemMutation } from '../generated/graphql';

export default function AddFtpServerModal({ children }: { children: (open: () => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ addLocalFileSystem ] = useAddLocalFileSystemMutation();
  const nameRef = useRef<any>();
  const [ name, setName ] = useState('');
  const [ path, setPath ] = useState('');
  const [ prefix, setPrefix ] = useState('');

  const open = useCallback(() => {
    setIsOpen(true);
    setName('');
    setPath('');
    setPrefix('');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const add = useCallback(async () => {
    await addLocalFileSystem({
      variables: {
        name,
        path,
        prefix,
      },
      update: (cache, { data }) => {
        if (data.addLocalFileSystem) {
          const queryData = Object.assign({}, cache.readQuery<AllStorageQuery>({ query: AllStorageDocument }));
          if (!queryData.allStorage) {
            queryData.allStorage = [data.addLocalFileSystem];
          } else if (!queryData.allStorage.find(item => item.name === data.addLocalFileSystem!.name)) {
            queryData.allStorage = [...queryData.allStorage, data.addLocalFileSystem];
          }
          cache.writeQuery({ query: AllStorageDocument, data: queryData });
        }
      }
    });
    close();
  }, [ name, path, prefix ]);

  return (
    <>
      { children(open) }
      <Modal size="xl" isOpen={ isOpen } onClose={ close } initialFocusRef={ nameRef }>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Local File System</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <InputGroup size="sm">
                <InputLeftAddon children="Name" />
                <Input ref={ nameRef } value={ name } onChange={ e => setName(e.target.value) } />
              </InputGroup>
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
            <Button ml="auto" colorScheme="green" onClick={ add } disabled={ !name || !path }>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

