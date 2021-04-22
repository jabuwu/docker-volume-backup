import * as React from "react"
import { Box, ChakraProvider, Flex, Link, Text } from "@chakra-ui/react"
import NextLink from 'next/link';
export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Box p={4} mx="auto" bg="lightblue" position="sticky">
        <Box m={ 1 } mx="auto" maxW="1000px" w="100%">
          <Flex>
            <Text fontWeight="extrabold" fontSize="lg">Docker Volume Backup</Text>
            <NextLink href="/">
              <Link ml={ 4 } my="auto">Volumes</Link>
            </NextLink>
            <NextLink href="/storage">
              <Link ml={ 4 } my="auto">Storage</Link>
            </NextLink>
          </Flex>
        </Box>
      </Box>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}