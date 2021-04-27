import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Button, Alert, AlertIcon, Checkbox, InputRightElement, NumberInput, NumberInputField } from '@chakra-ui/react';
import React, { useState, useCallback, useEffect } from 'react';
import { useFtpServerLazyQuery, useUpdateFtpServerMutation } from '../generated/graphql';

const noPassManager = { autoComplete: 'new-password', "data-lpignore": 'true' };

export default function EditS3BucketModal({ children }: { children: (open: (name: string) => void) => any }) {
  const [ isOpen, setIsOpen ] = useState(false)
  const [ updateFtpServer ] = useUpdateFtpServerMutation();
  const [ getFtpServer, { data, loading, error } ] = useFtpServerLazyQuery();
  const [ showPassword, setShowPassword ] = useState(false);
  const [ name, setName ] = useState('');
  const [ host, setHost ] = useState('');
  const [ user, setUser ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ secure, setSecure ] = useState(false);
  const [ port, setPort ] = useState(21);
  const [ prefix, setPrefix ] = useState('');

  const open = useCallback((name: string) => {
    setName(name);
    setIsOpen(true);
    getFtpServer({ variables: { name } });
    setHost('');
    setUser('');
    setPassword('');
    setSecure(false);
    setPort(21);
    setPrefix('');
  }, []);

  useEffect(() => {
    if (data && data.storage && data.storage.ftpServer) {
      setHost(data.storage!.ftpServer!.host);
      setUser(data.storage!.ftpServer!.user);
      setPassword('');
      setSecure(data.storage!.ftpServer!.secure);
      setPort(data.storage!.ftpServer!.port);
      setPrefix(data.storage!.ftpServer!.prefix);
    }
  }, [ isOpen, data ]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const update = useCallback(async () => {
    await updateFtpServer({
      variables: {
        name,
        host,
        user,
        secure,
        port,
        prefix,
        ...(password ? { password } : {})
      }
    });
    close();
  }, [ name, host, user, password, secure, port, prefix ]);

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
                <InputLeftAddon children="Host" />
                <Input value={ host } onChange={ e => setHost(e.target.value) } { ...noPassManager } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="User" />
                <Input value={ user } onChange={ e => setUser(e.target.value) } { ...noPassManager } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Password" />
                <Input placeholder="**************" value={ password } onChange={ e => setPassword(e.target.value) } type={ showPassword ? "text" : "password" } { ...noPassManager } />
                { password ?
                  <InputRightElement width="4.5rem">
                    <Button h="24px" size="sm" onClick={ () => setShowPassword(value => !value) }>
                      { showPassword ? "Hide" : "Show" }
                    </Button>
                  </InputRightElement>
                : null }
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
            <Button colorScheme="blue" onClick={ update } isLoading={ loading } disabled={ !!error || !name || !user || !port }>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
