import withApollo from '../apollo';
import Wrapper from '../components/wrapper';
import Title from '../components/title';
import { Text } from '@chakra-ui/layout';
import { useStorageQuery } from '../generated/graphql';
import { Alert, AlertIcon, Spinner, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import LoadingTr from '../components/loading-tr';

export default withApollo({ ssr: true })(function(): any {
  const { data, loading, error } = useStorageQuery();
  let message: JSX.Element | null = null;
  let s3Table: JSX.Element | null = null;
  let s3Message: JSX.Element | null = null;
  if (loading) {
    s3Table = <LoadingTr colSpan={ 2 } />
  } else if (error) {
    message = (
      <Alert status="error" mt={ 2 }>
        <AlertIcon />
        Failed to fetch storage information.
      </Alert>
    );
  } else {
    s3Table = <>{ data.s3Buckets.map(s3Bucket => (
      <Tr key={ s3Bucket.name }>
        <Td>
          <Text fontWeight="bold">{ s3Bucket.name }</Text>
        </Td>
        <Td>
          <Text>{ `s3://${s3Bucket.bucket}` }</Text>
        </Td>
      </Tr>
    ))}</>;
  }
  if (!s3Table) {
    s3Message = <Text mt={ 2 }>Nothing to see here.</Text>;
  }
  return (
    <Wrapper>
      <Title>Storage</Title>
      <Text as="h1" fontSize="4xl">Storage { loading ? <Spinner size="md" /> : null }</Text>
      { message }
      <Text mt={ 4 } fontSize="xl">S3 Buckets</Text>
      { s3Message }
      { s3Table ? (<Table variant="striped">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Bucket</Th>
          </Tr>
        </Thead>
        <Tbody>
          { s3Table }
        </Tbody>
      </Table>) : null }
    </Wrapper>
  )
});