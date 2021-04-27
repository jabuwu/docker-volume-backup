import { InfoIcon } from '@chakra-ui/icons';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, InputGroup, InputLeftAddon, Input, ModalFooter, Button, Text, Collapse, Link, Box, Code, Flex, Alert, AlertIcon } from '@chakra-ui/react';
import React, { useRef, useCallback, useState } from 'react';
import { AllStorageDocument, AllStorageQuery, useAddS3BucketMutation } from '../generated/graphql';

function makePolicy(bucket: string, prefix: string) {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Action: [
          's3:DeleteObject',
          's3:GetObject',
          's3:ListBucket',
          's3:PutObject'
        ],
        Effect: 'Allow',
        Resource: [
          `arn:aws:s3:::${bucket}`,
          `arn:aws:s3:::${bucket}/${prefix}*`
        ]
      }
    ]
  };
}

function selectElementText(element) {
  const doc = window.document as any;
  if (window.getSelection && doc.createRange) {
    const selection = window.getSelection();
    const range = doc.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  } else if (doc.body.createTextRange) {
    const range = doc.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  }
}

export default function AddS3BucketModal({ children }: { children: (open: () => void) => JSX.Element }) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ addS3Bucket ] = useAddS3BucketMutation();
  const [ showInfo, setShowInfo ] = useState(false);
  const [ showPolicy, setShowPolicy ] = useState(false);
  const nameRef = useRef<any>();
  const [ name, setName ] = useState('');
  const [ bucket, setBucket ] = useState('');
  const [ region, setRegion ] = useState('');
  const [ accessKey, setAccessKey ] = useState('');
  const [ secretKey, setSecretKey ] = useState('');
  const [ prefix, setPrefix ] = useState('');

  const open = useCallback(() => {
    setIsOpen(true);
    setShowInfo(false);
    setShowPolicy(false);
    setName('');
    setBucket('');
    setRegion('');
    setAccessKey('');
    setSecretKey('');
    setPrefix('');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const add = useCallback(async () => {
    await addS3Bucket({
      variables: {
        name,
        bucket,
        region,
        accessKey,
        secretKey,
        prefix,
      },
      update: (cache, { data }) => {
        if (data.addS3Bucket) {
          const queryData = Object.assign({}, cache.readQuery<AllStorageQuery>({ query: AllStorageDocument }));
          if (!queryData.allStorage) {
            queryData.allStorage = [data.addS3Bucket];
          } else if (!queryData.allStorage.find(item => item.name === data.addS3Bucket!.name)) {
            queryData.allStorage = [...queryData.allStorage, data.addS3Bucket];
          }
          cache.writeQuery({ query: AllStorageDocument, data: queryData });
        }
      }
    });
    close();
  }, [ name, bucket, region, accessKey, secretKey, prefix ]);

  return (
    <>
      { children(open) }
      <Modal size="xl" isOpen={ isOpen } onClose={ close } initialFocusRef={ nameRef }>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add S3 Bucket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>It is highly recommended that you create a dedicated <Link href="https://aws.amazon.com/iam/" target="_blank" fontWeight="bold">IAM user</Link> with restricted permissions to your AWS account.</Text>
            <Collapse in={ showInfo } animateOpacity>
              <Box my={ 4 }>
                <Text>Create a new user in your AWS account and enable programmatic access, then fill out the form below and press the <Text as="span" fontWeight="bold">Show Policy</Text> button to generate a working IAM policy that you can attach to the user. Doing so protects your AWS account in the unlikely event that your <Text as="span" fontWeight="bold">Docker Volume Backup</Text> instance becomes compromised.</Text>
                <Text my={ 4 }></Text>
              </Box>
            </Collapse>
            <Text mb={ 8 }><Link fontWeight="bold" onClick={ () => setShowInfo(value => !value) }>{ showInfo ? 'Show less' : 'Show more' }</Link></Text>
            <Stack spacing={4}>
              <InputGroup size="sm">
                <InputLeftAddon children="Name" />
                <Input ref={ nameRef } value={ name } onChange={ e => setName(e.target.value) } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Bucket" />
                <Input value={ bucket } onChange={ e => setBucket(e.target.value) } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Region" />
                <Input value={ region } onChange={ e => setRegion(e.target.value) } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Access Key" />
                <Input value={ accessKey } onChange={ e => setAccessKey(e.target.value) } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Secret Key" />
                <Input value={ secretKey } onChange={ e => setSecretKey(e.target.value) } />
              </InputGroup>
              <InputGroup size="sm">
                <InputLeftAddon children="Prefix" />
                <Input value={ prefix } onChange={ e => setPrefix(e.target.value) } />
              </InputGroup>
            </Stack>
            <Collapse in={ showPolicy } animateOpacity>
              { bucket ?
                <Code mt={ 4 } as="pre" width="100%" onClick={ e => selectElementText(e.target) } cursor="pointer">{ JSON.stringify(makePolicy(bucket, prefix), null, 2) }</Code>
              : null }
              { !bucket ?
                <Alert status="error" mt={ 4 }>
                  <AlertIcon />
                  Policy not available. Please fill out the form above.
                </Alert>
              : null }
            </Collapse>
          </ModalBody>
          <ModalFooter>
            <Flex width="100%">
              <Button colorScheme="gray" onClick={ () => setShowPolicy(value => !value) } leftIcon={ <InfoIcon /> }>
                { showPolicy ? 'Hide Policy' : 'Show Policy' }
              </Button>
              <Button ml="auto" colorScheme="green" onClick={ add } disabled={ !name || !bucket || !region || !accessKey || !secretKey }>
                Add
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}