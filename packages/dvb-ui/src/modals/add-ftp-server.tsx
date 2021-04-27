import { InfoIcon } from '@chakra-ui/icons';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Button, Text, Collapse, Link, Box, Code, Flex, Alert, AlertIcon, InputRightElement, NumberInput, NumberInputField, Checkbox } from '@chakra-ui/react';
import React, { useRef, useCallback, useState } from 'react';
import { AllStorageDocument, AllStorageQuery, useAddFtpServerMutation } from '../generated/graphql';

const noPassManager = { autoComplete: 'new-password', "data-lpignore": 'true' };

export default function AddFtpServerModal({ children }: { children: (open: () => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ addFtpServer ] = useAddFtpServerMutation();
  const [ showPassword, setShowPassword ] = useState(false);
  const nameRef = useRef<any>();
  const [ name, setName ] = useState('');
  const [ host, setHost ] = useState('');
  const [ user, setUser ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ secure, setSecure ] = useState(false);
  const [ port, setPort ] = useState(21);
  const [ prefix, setPrefix ] = useState('');

  const open = useCallback(() => {
    setIsOpen(true);
    setShowPassword(false);
    setName('');
    setHost('');
    setUser('');
    setPassword('');
    setSecure(true);
    setPort(22);
    setPrefix('');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const add = useCallback(async () => {
    await addFtpServer({
      variables: {
        name,
        host,
        user,
        password,
        secure,
        port,
        prefix,
      },
      update: (cache, { data }) => {
        if (data.addFtpServer) {
          const queryData = Object.assign({}, cache.readQuery<AllStorageQuery>({ query: AllStorageDocument }));
          if (!queryData.allStorage) {
            queryData.allStorage = [data.addFtpServer];
          } else if (!queryData.allStorage.find(item => item.name === data.addFtpServer!.name)) {
            queryData.allStorage = [...queryData.allStorage, data.addFtpServer];
          }
          cache.writeQuery({ query: AllStorageDocument, data: queryData });
        }
      }
    });
    close();
  }, [ name, host, user, password, secure, port, prefix ]);

  return (
    <>
      { children(open) }
      <Modal size="xl" isOpen={ isOpen } onClose={ close } initialFocusRef={ nameRef }>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add FTP Server</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <InputGroup size="sm">
                <InputLeftAddon children="Name" />
                <Input ref={ nameRef } value={ name } onChange={ e => setName(e.target.value) } { ...noPassManager } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Host" />
                <Input value={ host } onChange={ e => setHost(e.target.value) } { ...noPassManager } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="User" />
                <Input value={ user } onChange={ e => setUser(e.target.value) } { ...noPassManager } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Password" />
                <Input value={ password } onChange={ e => setPassword(e.target.value) } type={ showPassword ? "text" : "password" } { ...noPassManager } />
                <InputRightElement width="4.5rem">
                  <Button h="24px" size="sm" onClick={ () => setShowPassword(value => !value) }>
                    { showPassword ? "Hide" : "Show" }
                  </Button>
                </InputRightElement>
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Port" />
                <NumberInput value={ port } onChange={ num => setPort(Number(num)) } min={ 1 } max={ 65535 } w="100%">
                  <NumberInputField { ...noPassManager } />
                </NumberInput>
                <InputRightElement mr="34px">
                  <Checkbox isChecked={ secure } onChange={ e => setSecure(e.target.checked) } colorScheme="green" defaultIsChecked ml="auto" { ...noPassManager }>
                    Secure
                  </Checkbox>
                </InputRightElement>
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Prefix" />
                <Input value={ prefix } onChange={ e => setPrefix(e.target.value) } { ...noPassManager } />
              </InputGroup>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button ml="auto" colorScheme="green" onClick={ add } disabled={ !name || !user || !password || !port }>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
