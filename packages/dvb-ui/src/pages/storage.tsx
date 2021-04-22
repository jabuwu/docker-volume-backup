import withApollo from '../apollo';
import Wrapper from '../components/wrapper';
import Title from '../components/title';
import { Text } from '@chakra-ui/layout';
import { useStorageQuery, useAddS3BucketMutation, useRemoveS3BucketMutation } from '../generated/graphql';
import LoadingTr from '../components/loading-tr';
import { useState, useRef } from 'react';
import {
  Alert,
  AlertIcon,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent, ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stack,
  InputGroup,
  InputLeftAddon,
  Input,
  InputRightAddon
} from '@chakra-ui/react';

function addS3BucketModalFn() {
  const [ open, setOpen ] = useState(false);
  const [ addS3Bucket ] = useAddS3BucketMutation();
  const name = useRef<any>();
  const bucket = useRef<any>();
  const region = useRef<any>();
  const accessKey = useRef<any>();
  const secretKey = useRef<any>();
  const prefix = useRef<any>();

  function close() {
    setOpen(false);
  }

  function add() {
    addS3Bucket({
      variables: {
        name: name.current!.value,
        bucket: bucket.current!.value,
        region: region.current!.value,
        accessKey: accessKey.current!.value,
        secretKey: secretKey.current!.value,
        prefix: prefix.current!.value,
      }
    });
  }

  return {
    open: () => setOpen(true),
    jsx: <Modal size="xl" isOpen={ open } onClose={ close }>
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
          <Button colorScheme="green" mr={ 3 } onClick={ add }>
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  }
}

export default withApollo({ ssr: true })(function(): any {
  const { data, loading, error } = useStorageQuery();
  let message: JSX.Element | null = null;
  let s3Table: JSX.Element | null = null;
  let s3Message: JSX.Element | null = null;
  const addS3BucketModal = addS3BucketModalFn();
  const [ removeS3Bucket ] = useRemoveS3BucketMutation();
  if (loading) {
    s3Table = <LoadingTr colSpan={ 4 } />
  } else if (error) {
    message = (
      <Alert status="error" mt={ 2 }>
        <AlertIcon />
        Failed to fetch storage information.
      </Alert>
    );
    s3Message = <Text mt={ 2 }>Nothing to see here.</Text>;
  } else if (data.s3Buckets.length === 0) {
    s3Message = <Text mt={ 2 }>Nothing to see here.</Text>;
  } else {
    s3Table = <>{ data.s3Buckets.map(s3Bucket => (
      <Tr key={ s3Bucket.name }>
        <Td>
          <Text fontWeight="bold">{ s3Bucket.name }</Text>
        </Td>
        <Td>
          <Text>{ `s3://${s3Bucket.bucket}` }</Text>
        </Td>
        <Td>
          <Text>{ s3Bucket.prefix}</Text>
        </Td>
        <Td>
          <Button colorScheme="red" onClick={ () => removeS3Bucket({ variables: { name: s3Bucket.name } }) }>Remove</Button>
        </Td>
      </Tr>
    ))}</>;
  }
  return (
    <Wrapper>
      <Title>Storage</Title>
      <Text as="h1" fontSize="4xl">Storage { loading ? <Spinner size="md" /> : null }</Text>
      { message }
      <Flex mt={ 4 }>
        <Text fontSize="xl">S3 Buckets</Text>
        { (!loading && !error) ? <Button size="sm" ml="auto" colorScheme="green" onClick={ addS3BucketModal.open }>Add S3 Bucket</Button> : null }
      </Flex>
      { s3Message }
      { s3Table ? (<Table variant="striped">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Bucket</Th>
            <Th>Prefix</Th>
            <Th>Operations</Th>
          </Tr>
        </Thead>
        <Tbody>
          { s3Table }
        </Tbody>
      </Table>) : null }
      { addS3BucketModal.jsx }
    </Wrapper>
  )
});