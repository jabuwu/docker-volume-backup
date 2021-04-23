import { useVolumeCreatedSubscription, useVolumeDestroyedSubscription } from '../generated/graphql';
import { useToast } from '@chakra-ui/react';

export default function Alerts() {
  const toast = useToast();

  useVolumeCreatedSubscription({
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data) {
        toast({
          title: 'Volume Created',
          description: subscriptionData.data.volumeCreated.name,
          status: 'info',
          isClosable: true,
        });
      }
    },
  });

  useVolumeDestroyedSubscription({
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data) {
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