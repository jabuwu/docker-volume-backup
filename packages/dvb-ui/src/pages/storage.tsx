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
  Link,
  Tooltip
} from '@chakra-ui/react';
import NextLink from 'next/link';
import AddS3BucketModal from '../modals/add-s3-bucket';
import EditS3BucketModal from '../modals/edit-s3-bucket';
import AddFtpServerModal from '../modals/add-ftp-server';
import EditFtpServerModal from '../modals/edit-ftp-server';
import { AddIcon, DeleteIcon, LockIcon, RepeatIcon, SettingsIcon, UnlockIcon } from '@chakra-ui/icons';
import ConfirmDelete from '../modals/confirm-delete';

export default function Storage(): any {
  const { data, loading, error, refetch } = useAllStorageQuery({ notifyOnNetworkStatusChange: true });
  let message: JSX.Element | null = null;
  let s3Table: ((openEdit: (name: string) => void) => JSX.Element) | null = null;
  let s3Message: JSX.Element | null = null;
  let ftpTable: ((openEdit: (name: string) => void) => JSX.Element) | null = null;
  let ftpMessage: JSX.Element | null = null;
  const [ removeStorage ] = useRemoveStorageMutation();
  const s3Buckets = data?.allStorage.filter(storage => storage.type === 's3Bucket') || [];
  const ftpServers = data?.allStorage.filter(storage => storage.type === 'ftpServer') || [];
  if (loading) {
    s3Table = () => <LoadingTr colSpan={ 4 } />
    ftpTable = () => <LoadingTr colSpan={ 5 } />
  } else if (error) {
    message = (
      <Alert status="error" mt={ 2 }>
        <AlertIcon />
        Failed to fetch storage information. { error.message }
      </Alert>
    );
    s3Message = <Text mt={ 2 }>Nothing to see here.</Text>;
    ftpMessage = <Text mt={ 2 }>Nothing to see here.</Text>;
  } else {
    if (s3Buckets.length === 0) {
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
    if (ftpServers.length === 0) {
      ftpMessage = <Text mt={ 2 }>Nothing to see here.</Text>;
    } else {
      ftpTable = (openEdit) => (
        <>
          { ftpServers.map(ftpServer => (
            <Tr key={ ftpServer.name }>
              <Td>
                <NextLink href={ `/storage/${ftpServer.name}` }>
                  <Link fontWeight="bold">{ ftpServer.name }</Link>
                </NextLink>
              </Td>
              <Td>
                <Flex>
                  { ftpServer.ftpServer!.secure ? <Tooltip label="Secure"><LockIcon my="auto" color="lightgreen" /></Tooltip> : <Tooltip label="Insecure"><UnlockIcon my="auto" color="pink" /></Tooltip> }
                  <Text my="auto" ml={ 2 }>{ `ftp://${ftpServer.ftpServer!.host}:${ftpServer.ftpServer!.port}` }</Text>
                </Flex>
              </Td>
              <Td>
                <Text>{ ftpServer.ftpServer!.user }</Text>
              </Td>
              <Td>
                <Text>{ ftpServer.ftpServer!.prefix ? ftpServer.ftpServer!.prefix : <Text as="i" color="lightgray">none</Text> }</Text>
              </Td>
              <Td textAlign="right">
                <Button size="lg" p={ 0 } variant="ghost" colorScheme="blue" onClick={ () => openEdit(ftpServer.name) } isLoading={ loading }><SettingsIcon /></Button>
                <ConfirmDelete name={ ftpServer.name } onDelete={ () => removeStorage({ variables: { name: ftpServer.name }, update: (cache) => {
                  cache.evict({ id: cache.identify(ftpServer) });
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
      <Flex mt={ 8 }>
        <Text fontSize="xl">FTP Servers</Text>
        <Box my="auto" ml={ 2 }>
          <AddFtpServerModal>
            { (open) => (
              <Button size="sm" variant="ghost" colorScheme="blue" onClick={ open } isLoading={ loading } disable={ error }><AddIcon /></Button>
            ) }
          </AddFtpServerModal>
        </Box>
      </Flex>
      { ftpMessage }
      <EditFtpServerModal>
        { (openEdit) => ftpTable ? (<Table variant="striped">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Host</Th>
                <Th>User</Th>
                <Th>Prefix</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              { ftpTable(openEdit) }
            </Tbody>
          </Table>) : null
        }
      </EditFtpServerModal>
      <Box mt={ 8 }></Box>
    </Wrapper>
  )
}