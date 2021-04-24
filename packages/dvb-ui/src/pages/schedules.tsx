import { Text } from '@chakra-ui/layout';
import { useSchedulesQuery, useRemoveScheduleMutation } from '../generated/graphql';
import Wrapper from '../components/wrapper';
import Title from '../components/title';
import React, { useState } from 'react';
import { Alert, AlertIcon, Box, Button, Spinner, Table, Tbody, Td, Th, Thead, Tr, Flex } from '@chakra-ui/react';
import LoadingTr  from '../components/loading-tr';
import AddScheduleModal from '../modals/add-schedule';
import { AddIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons';

export default function Schedules(): any {
  const { data, loading, error, refetch } = useSchedulesQuery({ notifyOnNetworkStatusChange: true });
  let message: JSX.Element | null = null;
  let table: JSX.Element | null = null;
  const [ removeSchedule ] = useRemoveScheduleMutation();
  const [ addScheduleModal, setAddScheduleModal ] = useState(false);
  if (loading) {
    table = <LoadingTr colSpan={ 4 } />
  } else if (error) {
    message = (
      <Alert status="error" mt={ 2 }>
        <AlertIcon />
        Failed to fetch schedules. { error.message }
      </Alert>
    );
  } else if (data.schedules.length === 0) {
    message = (
      <Text mt={ 2 }>No schedules found.</Text>
    );
  } else {
    table = <>{ data.schedules.map(schedule => (
      <Tr key={ schedule.id }>
        <Td>
          <Text>{ schedule.volume }</Text>
        </Td>
        <Td>
          <Text>{ schedule.storage }</Text>
        </Td>
        <Td>
          <Text>{ schedule.hours }</Text>
        </Td>
        <Td textAlign="right">
          <Button colorScheme="red" variant="ghost" onClick={ () => removeSchedule({ variables: { id: schedule.id }, update: (cache) => {
            cache.evict({ id: cache.identify(schedule) });
          } }) }><DeleteIcon /></Button>
        </Td>
      </Tr>
    ))}</>;
  }
  return (
    <Wrapper>
      <Title>Schedules</Title>
      <Flex mt={ 4 }>
        <Text as="h1" fontSize="4xl">Schedules</Text>
        <Box ml={ 2 } mt="auto">
          <Button size="lg" p={ 0 } variant="ghost" colorScheme="blue" onClick={ () => setAddScheduleModal(true) } isLoading={ loading }><AddIcon /></Button>
        </Box>
        <Box ml="auto" mt="auto">
          <Button size="lg" p={ 0 } variant="ghost" colorScheme="green" onClick={ () => refetch() } isLoading={ loading }><RepeatIcon /></Button>
        </Box>
      </Flex>
      {/* <Flex mt={ 4 }>
        <Text as="h1" fontSize="4xl">Schedules { loading ? <Spinner size="md" /> : null }</Text>
        <Box ml="auto" mt="auto">
          <Button size="sm" colorScheme="blue" onClick={ () => setAddScheduleModal(true) } isLoading={ loading } disable={ error }>Add Schedule</Button>
          <Button size="sm" ml={ 2 } colorScheme="green" onClick={ () => refetch() } isLoading={ loading }>Refresh</Button>
        </Box>
      </Flex> */}
      { message }
      { table ? (<Table variant="striped">
        <Thead>
          <Tr>
            <Th>Volume</Th>
            <Th>Storage</Th>
            <Th>Hours</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          { table }
        </Tbody>
      </Table>) : null }
      <AddScheduleModal isOpen={ addScheduleModal } onClose={ () => setAddScheduleModal(false) } />
    </Wrapper>
  )
}