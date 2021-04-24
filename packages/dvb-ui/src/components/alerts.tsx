import { useVolumeCreatedSubscription, useVolumeDestroyedSubscription, VolumesDocument, VolumesQuery } from '../generated/graphql';
import { useToast } from '@chakra-ui/react';

export default function Alerts() {
  const toast = useToast();

  useVolumeCreatedSubscription({
    onSubscriptionData: ({ subscriptionData, client }) => {
      if (subscriptionData.data) {
        const volume = subscriptionData.data.volumeCreated
        const queryData = Object.assign({}, client.cache.readQuery<VolumesQuery>({ query: VolumesDocument }));
        if (!queryData.volumes.find(item => item.name === volume.name)) {
          queryData.volumes = [...queryData.volumes, volume];
        }
        client.cache.writeQuery({ query: VolumesDocument, data: queryData });
        toast({
          title: 'Volume Created',
          description: volume.name,
          status: 'info',
          isClosable: true,
        });
      }
    },
  });

  useVolumeDestroyedSubscription({
    onSubscriptionData: ({ subscriptionData, client }) => {
      if (subscriptionData.data) {
        client.cache.evict({
          id: `Volume:${JSON.stringify({ name: subscriptionData.data.volumeDestroyed })}`
        });
        toast({
          title: 'Volume Destroyed',
          description: subscriptionData.data.volumeDestroyed,
          status: 'error',
          isClosable: true,
        });
      }
    },
  });

  return <></>;
};