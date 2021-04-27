import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Button, Alert, AlertIcon } from '@chakra-ui/react';
import React, { useState, useCallback, useEffect } from 'react';
import { useS3BucketLazyQuery, useUpdateS3BucketMutation } from '../generated/graphql';

export default function EditS3BucketModal({ children }: { children: (open: (name: string) => void) => any }) {
  const [ isOpen, setIsOpen ] = useState(false)
  const [ updateS3Bucket ] = useUpdateS3BucketMutation();
  const [ getS3Bucket, { data, loading, error } ] = useS3BucketLazyQuery();
  const [ name, setName ] = useState('');
  const [ bucket, setBucket ] = useState('');
  const [ region, setRegion ] = useState('');
  const [ accessKey, setAccessKey ] = useState('');
  const [ secretKey, setSecretKey ] = useState('');
  const [ prefix, setPrefix ] = useState('');

  const open = useCallback((name: string) => {
    setName(name);
    setIsOpen(true);
    getS3Bucket({ variables: { name } });
    setBucket('');
    setRegion('');
    setAccessKey('');
    setSecretKey('');
    setPrefix('');
  }, []);

  useEffect(() => {
    if (data && data.storage && data.storage.s3Bucket) {
      setBucket(data.storage!.s3Bucket!.bucket);
      setRegion(data.storage!.s3Bucket!.region);
      setAccessKey(data.storage!.s3Bucket!.accessKey);
      setSecretKey('');
      setPrefix(data.storage!.s3Bucket!.prefix);
    }
  }, [ isOpen, data ]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const update = useCallback(async () => {
    await updateS3Bucket({
      variables: {
        name,
        bucket,
        region,
        accessKey,
        prefix,
        ...(secretKey ? { secretKey } : {})
      }
    });
    close();
  }, [ name, bucket, region, accessKey, secretKey, prefix ]);

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
                <InputLeftAddon children="Bucket" />
                <Input value={ bucket } onChange={ e => setBucket(e.target.value) } disabled={ loading || !!error } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Region" />
                <Input value={ region } onChange={ e => setRegion(e.target.value) } disabled={ loading || !!error } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Access Key" />
                <Input value={ accessKey } onChange={ e => setAccessKey(e.target.value) } disabled={ loading || !!error } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Secret Key" />
                <Input placeholder="**************" value={ secretKey } onChange={ e => setSecretKey(e.target.value) } disabled={ loading || !!error } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Prefix" />
                <Input value={ prefix } onChange={ e => setPrefix(e.target.value) } disabled={ loading || !!error } />
              </InputGroup>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={ update } isLoading={ loading } disabled={ !!error || !name || !bucket || !region || !accessKey }>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
