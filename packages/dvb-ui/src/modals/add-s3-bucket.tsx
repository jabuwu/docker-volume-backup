import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Button } from '@chakra-ui/react';
import React, { useRef, useCallback } from 'react';
import { useAddS3BucketMutation } from '../generated/graphql';

export default function AddS3BucketModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: () => void }) {
  const [ addS3Bucket ] = useAddS3BucketMutation();
  const name = useRef<any>();
  const bucket = useRef<any>();
  const region = useRef<any>();
  const accessKey = useRef<any>();
  const secretKey = useRef<any>();
  const prefix = useRef<any>();

  const add = useCallback(async () => {
    await addS3Bucket({
      variables: {
        name: name.current!.value,
        bucket: bucket.current!.value,
        region: region.current!.value,
        accessKey: accessKey.current!.value,
        secretKey: secretKey.current!.value,
        prefix: prefix.current!.value,
      }
    });
    onAdd();
    onClose();
  }, [ name, bucket, region, accessKey, secretKey, prefix ]);

  return (
    <Modal size="xl" isOpen={ isOpen } onClose={ onClose }>
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
  );
}