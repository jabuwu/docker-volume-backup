import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Button } from '@chakra-ui/react';
import React, { useRef, useCallback } from 'react';
import { AllStorageDocument, AllStorageQuery, useAddS3BucketMutation } from '../generated/graphql';

export default function AddS3BucketModal({ children }: { children: (open: () => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ addS3Bucket ] = useAddS3BucketMutation();
  const name = useRef<any>();
  const bucket = useRef<any>();
  const region = useRef<any>();
  const accessKey = useRef<any>();
  const secretKey = useRef<any>();
  const prefix = useRef<any>();

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const add = useCallback(async () => {
    await addS3Bucket({
      variables: {
        name: name.current!.value,
        bucket: bucket.current!.value,
        region: region.current!.value,
        accessKey: accessKey.current!.value,
        secretKey: secretKey.current!.value,
        prefix: prefix.current!.value,
      },
      update: (cache, { data }) => {
        if (data.addS3Bucket) {
          const queryData = Object.assign({}, cache.readQuery<AllStorageQuery>({ query: AllStorageDocument }));
          if (!queryData.allStorage.find(item => item.name === data.addS3Bucket!.name)) {
            queryData.allStorage = [...queryData.allStorage, data.addS3Bucket];
          }
          cache.writeQuery({ query: AllStorageDocument, data: queryData });
        }
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
          <ModalHeader>Add S3 Bucket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <InputGroup size="sm">
                <InputLeftAddon children="Name" />
                <Input ref={ name } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Bucket" />
                <Input ref={ bucket } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Region" />
                <Input ref={ region } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Access Key" />
                <Input ref={ accessKey } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Secret Key" />
                <Input ref={ secretKey } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Prefix" />
                <Input ref={ prefix } />
              </InputGroup>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={ add }>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}