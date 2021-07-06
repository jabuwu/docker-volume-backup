import { RepeatIcon } from '@chakra-ui/icons';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Spinner, Alert, AlertIcon, AlertDescription, IconButton, Box, Stack, Text } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { useVolumeInfoLazyQuery } from '../generated/graphql';
import { formatBytes } from '../utility/format-bytes';

export default function InfoVolumeModal({ children }: { children: (open: (volumeName: string) => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false);
  const [ volume, setVolume ] = React.useState('');

  const [ getVolumeInfo, { data, loading, error } ] = useVolumeInfoLazyQuery({
    fetchPolicy: 'no-cache',
  });

  const open = useCallback((volumeName: string) => {
    setIsOpen(true);
    setVolume(volumeName);
    getVolumeInfo({
      variables: {
        name: volumeName,
      }
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      { children(open) }
      <Modal size="xl" isOpen={ isOpen } onClose={ close }>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{ volume } Info</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            { loading && <Box align="center">
              <Spinner />
            </Box> }
            { data && data.volume && <>
              { !data.volume.info.isDirectory && <Stack>
                <Text><b>Is Directory</b>: false</Text>
              </Stack> }
              { data.volume.info.isDirectory && <Stack>
                <Text><b>Is Directory:</b> true</Text>
                <Text><b>Approximate Size:</b> { formatBytes(data.volume.info.approximateSize) }</Text>
              </Stack> }
            </> }
            { error || (data && !data.volume) && <>
              <Alert status="error">
                <AlertIcon />
                <AlertDescription>Failed to fetch volume info.</AlertDescription>
              </Alert>
            </> }
          </ModalBody>
          <ModalFooter>
            { !loading && <IconButton aria-label="Refresh" icon={ <RepeatIcon /> } colorScheme="green" variant="ghost" onClick={ () => {
              getVolumeInfo({
                variables: {
                  name: volume
                },
              });
            } } /> }
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}