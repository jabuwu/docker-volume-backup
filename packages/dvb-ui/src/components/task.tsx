import { useToast } from '@chakra-ui/toast';
import { useCallback, useState, useEffect } from 'react';
import { useTaskUpdatedSubscription } from '../generated/graphql';

export function Task({ children, onResult }: { children: ({ track, status, progress, complete, completeFlair, error }: { track: (id: string) => void, status: string | null, progress: number | null, complete: boolean, completeFlair: boolean, error: string | null }) => any, onResult?: (result: any) => void }) {
  const toast = useToast();
  const [ id, setId ] = useState('');
  const [ progress, setProgress ] = useState(null as number | null);
  const [ status, setStatus ] = useState(null as string | null);
  const [ complete, setComplete ] = useState(true);
  const [ completeFlair, setCompleteFlair ] = useState(false);
  const [ error, setError ] = useState(null as string | null);
  const { error: subscriptionError } = useTaskUpdatedSubscription({
    variables: {
      id,
    },
    skip: !id,
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data) {
        const status = subscriptionData?.data.taskUpdated;
        if (status.done) {
          setComplete(true);
          setCompleteFlair(true);
          if (!status.error && status.result != null) {
            onResult?.(status.result);
          }
          if (status.error) {
            setError(status.error);
          }
        } else {
          setProgress(status.progress ?? null);
          setStatus(status.status || null);
        }
      }
    },
  });
  const track = useCallback((id: string) => {
    setId(id);
    if (id) {
      setComplete(false);
    } else {
      setComplete(true);
    }
  }, []);
  useEffect(() => {
    if (error) {
      setComplete(true);
      toast({
        title: 'Task Failed',
        description: error,
        status: 'error',
      });
    }
  }, [ error ]);
  useEffect(() => {
    if (subscriptionError) {
      setError(subscriptionError.message);
    }
  }, [ subscriptionError ]);
  useEffect(() => {
    setProgress(0);
    setStatus(null);
    if (complete) {
      setId('');
    }
    if (!complete) {
      setError(null);
    }
  }, [ complete ]);
  useEffect(() => {
    if (completeFlair) {
      const timeout = setTimeout(() => {
        setCompleteFlair(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [ completeFlair ]);
  return <>
    { children({ track, progress, status, complete, completeFlair, error: error }) }
  </>;
}