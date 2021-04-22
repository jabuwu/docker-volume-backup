import { Link, Text } from '@chakra-ui/layout';
import withApollo from '../apollo';
import { useVolumesQuery } from '../generated/graphql';
import Wrapper from '../components/wrapper';
import Title from '../components/title';
import React from 'react';
import { Alert, AlertIcon, Button, Skeleton, Spinner, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import NextLink from 'next/link';
import LoadingTr  from '../components/loading-tr';

export default withApollo({ ssr: true })(function(): any {
  const { data, loading, error } = useVolumesQuery();
  let message: JSX.Element | null = null;
  let table: JSX.Element | null = null;
  if (loading) {
    table = <LoadingTr colSpan={ 3 } />
  } else if (error) {
    message = (
      <Alert status="error" mt={ 2 }>
        <AlertIcon />
        Failed to fetch volumes.
      </Alert>
    );
  } else if (data.volumes.length === 0) {
    message = (
      <Text mt={ 2 }>No volumes found.</Text>
    );
  } else {
    table = <>{ data.volumes.map(volume => (
      <Tr key={ volume.name }>
        <Td>
          <NextLink href={ `/volumes/${volume.name}` }>
            <Link fontWeight="bold">{ volume.name }</Link>
          </NextLink>
        </Td>
        <Td>
          <Text>local</Text>
        </Td>
        <Td>
          <Button colorScheme="blue">Export</Button>
        </Td>
      </Tr>
    ))}</>;
  }
  return (
    <Wrapper>
      <Title>Volumes</Title>
      <Text as="h1" fontSize="4xl">Volumes { loading ? <Spinner size="md" /> : null }</Text>
      { message }
      { table ? (<Table variant="striped">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Driver</Th>
            <Th>Operations</Th>
          </Tr>
        </Thead>
        <Tbody>
          { table }
        </Tbody>
      </Table>) : null }
    </Wrapper>
  )
});