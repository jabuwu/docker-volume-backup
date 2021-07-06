import { useVolumesQuery, usePinVolumeMutation, useVolumeUpdatedSubscription } from '../generated/graphql';
import Wrapper from '../components/wrapper';
import Title from '../components/title';
import React from 'react';
import { Alert, AlertIcon, Button, Box, Table, Tbody, Td, Th, Thead, Tr, Flex, Text, Tooltip, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Tag, Link } from '@chakra-ui/react';
import { InfoIcon, RepeatIcon, StarIcon } from '@chakra-ui/icons';
import LoadingTr  from '../components/loading-tr';
import BackupVolumeModal from '../modals/backup-volume';
import RestoreVolumeModal from '../modals/restore-volume';
import NextLink from 'next/link';
import InfoVolumeModal from '../modals/info-volume';

export default function Index(): any {
  const { data, loading, error, refetch } = useVolumesQuery({ notifyOnNetworkStatusChange: true });
  const [ pinVolume ] = usePinVolumeMutation();
  useVolumeUpdatedSubscription();
  let message: JSX.Element | null = null;
  let table: ((openBackup: (volumeName: string, volumeSafeName: string) => void, openRestore: (volumeName: string, volumeSafeName: string) => void, openInfo: (volumeName: string) => void) => JSX.Element) | null = null;
  if (loading) {
    table = () => (<LoadingTr colSpan={ 4 } />);
  } else if (error) {
    message = (
      <Alert status="error" mt={ 2 }>
        <AlertIcon />
        Failed to fetch volumes. { error.message }
      </Alert>
    );
  } else if (data.volumes.length === 0) {
    message = (
      <Alert mt={ 2 }>No volumes found.</Alert>
    );
  } else {
    table = (openBackup, openRestore, openInfo) => (<>{ data.volumes.map(volume => (
      <Tr key={ volume.name }>
        <Td>
          <Flex>
            <Tooltip label={ volume.pinned ? 'Unpin Volume' : 'Pin volume' }>
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
            </Tooltip>
            <Box ml={ 2 } my="auto" fontWeight="bold">{
              volume.name.length > 30 ?
              <Tooltip label={ volume.name }><Text>{ `${volume.name.substr(0, 30)}...` }</Text></Tooltip> :
              <Text>{ volume.name }</Text>
            }</Box>
          </Flex>
        </Td>
        <Td>
          <Text>{ volume.driver ? `${volume.type}:${volume.driver}` : volume.type }</Text>
        </Td>
        <Td>
          <Popover>
            <PopoverTrigger>
              <Button variant="ghost" disabled={ volume.containers.length === 0 }>{ volume.containers.length }</Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Containers</PopoverHeader>
              <PopoverBody>
                {
                  volume.containers.map(container => (
                    <Tooltip label={ container.state === 'running' ? 'Container is running' : 'Container has stopped' } key={ container.id }>
                      <Tag m={ 1 } colorScheme={ container.state === 'running' ? 'green' : 'red' }>{ container.names[0].substr(1) }</Tag>
                    </Tooltip>
                  ))
                }
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Td>
        <Td textAlign="right">
          <Button colorScheme="blue" onClick={ () => openBackup(volume.name, volume.safeName) }>Backup</Button>
          <Button colorScheme="orange" ml={ 2 } onClick={ () => openRestore(volume.name, volume.safeName) }>Restore</Button>
          <Button colorScheme="gray" ml={ 2 } onClick={ () => openInfo(volume.name) }><InfoIcon /></Button>
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
      <Text>Below is a list of all volumes found. Volumes can be backed up or restored <Text as="b">manually</Text> here. To configure automatic updates, add a <NextLink href="/schedules"><Link>schedule</Link></NextLink>. Clicking the <StarIcon /> will pin a volume to the top.</Text>
      { message }
      <BackupVolumeModal>
        { (openBackup) => (
          <RestoreVolumeModal>
            { (openRestore) => (
              <InfoVolumeModal>
                { (openInfo) => (
                  <>
                    { table ? (<Table variant="striped">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Type</Th>
                          <Th>Containers</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        { table(openBackup, openRestore, openInfo) }
                      </Tbody>
                    </Table>) : null }
                  </>
                ) }
              </InfoVolumeModal>
            ) }
          </RestoreVolumeModal>
        ) }
      </BackupVolumeModal>
      <Box mt={ 8 }></Box>
    </Wrapper>
  )
}