import { useVolumesQuery, usePinVolumeMutation } from '../generated/graphql';
import Wrapper from '../components/wrapper';
import Title from '../components/title';
import React from 'react';
import { Alert, AlertIcon, Button, Box, Spinner, Table, Tbody, Td, Th, Thead, Tr, Flex, Text } from '@chakra-ui/react';
import { RepeatIcon, StarIcon } from '@chakra-ui/icons';
import LoadingTr  from '../components/loading-tr';
import BackupVolumeModal from '../modals/backup-volume';
import RestoreVolumeModal from '../modals/restore-volume';

export default function Index(): any {
  const { data, loading, error, refetch } = useVolumesQuery({ notifyOnNetworkStatusChange: true });
  const [ pinVolume ] = usePinVolumeMutation();
  let message: JSX.Element | null = null;
  let table: ((openBackup: (volume: string) => void, openRestore: (volume: string) => void) => JSX.Element) | null = null;
  if (loading) {
    table = () => (<LoadingTr colSpan={ 3 } />);
  } else if (error) {
    message = (
      <Alert status="error" mt={ 2 }>
        <AlertIcon />
        Failed to fetch volumes. { error.message }
      </Alert>
    );
  } else if (data.volumes.length === 0) {
    message = (
      <Text mt={ 2 }>No volumes found.</Text>
    );
  } else {
    table = (openBackup, openRestore) => (<>{ data.volumes.map(volume => (
      <Tr key={ volume.name }>
        <Td>
          <Flex>
            <Button size="sm" variant="ghost" colorScheme={ volume.pinned ? 'yellow' : 'blue' } onClick={ () => pinVolume({ variables: { volume: volume.name, pinned: !volume.pinned }, update: (cache) => {
              cache.modify({
                id: cache.identify(volume),
                fields: {
                  pinned: (value) => !value,
                },
              });
            } }) }>
              <StarIcon />
            </Button>
            <Text ml={ 2 } my="auto" fontWeight="bold">{ volume.name }</Text>
          </Flex>
        </Td>
        <Td>
          <Text>{ volume.driver }</Text>
        </Td>
        <Td textAlign="right">
          <Button colorScheme="blue" onClick={ () => openBackup(volume.name) }>Backup</Button>
          <Button colorScheme="orange" ml={ 2 } onClick={ () => openRestore(volume.name) }>Restore</Button>
        </Td>
      </Tr>
    ))}</>);
  }
  return (
    <Wrapper>
      <Title>Volumes</Title>
      <Flex mt={ 4 }>
        <Text as="h1" fontSize="4xl">Volumes</Text>
        <Box ml="auto" mt="auto">
          <Button size="lg" p={ 0 } variant="ghost" colorScheme="green" onClick={ () => refetch() } isLoading={ loading }><RepeatIcon /></Button>
        </Box>
      </Flex>
      { message }
      <BackupVolumeModal>
        { (openBackup) => (
          <RestoreVolumeModal>
            { (openRestore) => (
              <>
                { table ? (<Table variant="striped">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Driver</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    { table(openBackup, openRestore) }
                  </Tbody>
                </Table>) : null }
              </>
            ) }
          </RestoreVolumeModal>
        ) }
      </BackupVolumeModal>
    </Wrapper>
  )
}