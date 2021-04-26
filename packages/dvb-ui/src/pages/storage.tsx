import Wrapper from '../components/wrapper';
import Title from '../components/title';
import { Text } from '@chakra-ui/layout';
import { useAllStorageQuery, useRemoveStorageMutation } from '../generated/graphql';
import LoadingTr from '../components/loading-tr';
import React, { useState } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Button,
  Flex,
  Link
} from '@chakra-ui/react';
import NextLink from 'next/link';
import AddS3BucketModal from '../modals/add-s3-bucket';
import EditS3BucketModal from '../modals/edit-s3-bucket';
import { AddIcon, DeleteIcon, RepeatIcon, SettingsIcon } from '@chakra-ui/icons';
import ConfirmDelete from '../modals/confirm-delete';

export default function Storage(): any {
  const { data, loading, error, refetch } = useAllStorageQuery({ notifyOnNetworkStatusChange: true });
  let message: JSX.Element | null = null;
  let s3Table: ((openEdit: (name: string) => void) => JSX.Element) | null = null;
  let s3Message: JSX.Element | null = null;
  const [ removeStorage ] = useRemoveStorageMutation();
  const s3Buckets = data?.allStorage.filter(storage => storage.type === 's3Bucket') || [];
  if (loading) {
    s3Table = () => <LoadingTr colSpan={ 4 } />
  } else if (error) {
    message = (
      <Alert status="error" mt={ 2 }>
        <AlertIcon />
        Failed to fetch storage information. { error.message }
      </Alert>
    );
    s3Message = <Text mt={ 2 }>Nothing to see here.</Text>;
  } else if (s3Buckets.length === 0) {
    s3Message = <Text mt={ 2 }>Nothing to see here.</Text>;
  } else {
    s3Table = (openEdit) => (
      <>
        { s3Buckets.map(s3Bucket => (
          <Tr key={ s3Bucket.name }>
            <Td>
              <NextLink href={ `/storage/${s3Bucket.name}` }>
                <Link fontWeight="bold">{ s3Bucket.name }</Link>
              </NextLink>
            </Td>
            <Td>
              <Text>{ `s3://${s3Bucket.s3Bucket!.bucket}` }</Text>
            </Td>
            <Td>
              <Text>{ s3Bucket.s3Bucket!.prefix}</Text>
            </Td>
            <Td textAlign="right">
              <Button size="lg" p={ 0 } variant="ghost" colorScheme="blue" onClick={ () => openEdit(s3Bucket.name) } isLoading={ loading }><SettingsIcon /></Button>
              <ConfirmDelete name={ s3Bucket.name } onDelete={ () => removeStorage({ variables: { name: s3Bucket.name }, update: (cache) => {
                cache.evict({ id: cache.identify(s3Bucket) });
              } }) }>
                { (open) => (
                  <Button colorScheme="red" variant="ghost" onClick={ open }>
                    <DeleteIcon />
                  </Button>
                ) }
              </ConfirmDelete>
            </Td>
          </Tr>
        )) }
    </>);
  }
  return (
    <Wrapper>
      <Title>Storage</Title>
      <Flex mt={ 4 }>
        <Text as="h1" fontSize="4xl">Storage</Text>
        <Box ml="auto" mt="auto">
          <Button size="lg" p={ 0 } variant="ghost" colorScheme="green" onClick={ () => refetch() } isLoading={ loading }><RepeatIcon /></Button>
        </Box>
      </Flex>
      { message }
      <Text mt={ 4 }fontSize="xl">Local</Text>
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>Name</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <NextLink href={ `/storage/local` }>
                <Link fontWeight="bold">local</Link>
              </NextLink>
            </Td>
          </Tr>
        </Tbody>
      </Table>
      <Flex mt={ 8 }>
        <Text fontSize="xl">S3 Buckets</Text>
        <Box my="auto" ml={ 2 }>
          <AddS3BucketModal>
            { (open) => (
              <Button size="sm" variant="ghost" colorScheme="blue" onClick={ open } isLoading={ loading } disable={ error }><AddIcon /></Button>
            ) }
          </AddS3BucketModal>
        </Box>
      </Flex>
      { s3Message }
      <EditS3BucketModal>
        { (openEdit) => s3Table ? (<Table variant="striped">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Bucket</Th>
                <Th>Prefix</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              { s3Table(openEdit) }
            </Tbody>
          </Table>) : null
        }
      </EditS3BucketModal>
      <Box mt={ 8 }></Box>
    </Wrapper>
  )
}