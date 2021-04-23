import { Box, ChakraProvider, Flex, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useScroll } from '../effects/scroll';
export default function App({ Component, pageProps }) {
  const [ , scrollY ] = useScroll();
  const router = useRouter();
  const activeStyle = (path: string) => router.pathname === path ? { fontWeight: 'bold' as const, color: 'black' } : {};
  const RouterLink = ({ children, to }: { children: string, to: string }) => (
    <NextLink href={ to }>
      <Link ml={ 4 } my="auto" color="#333" style={{ textDecoration: 'none', ...activeStyle(to) }} _hover={{ color: 'black' }}>{ children }</Link>
    </NextLink>
  );
  return (
    <ChakraProvider>
      <Box p={4} mx="auto" bg="lightblue" position="sticky" top={ 0 } zIndex={ 1 } boxShadow={ `0px 0px ${Math.min(4, scrollY)}px rgba(0, 0, 0, 0.3)` }>
        <Box m={ 1 } mx="auto" maxW="1000px" w="100%">
          <Flex>
            <Text fontWeight="extrabold" fontSize="sm" textAlign="center" mr={ 4 } transform="rotate(-10deg)" color="white" textShadow="1px 1px 1px black">Docker Volume<br />Backup</Text>
            <RouterLink to="/">Volumes</RouterLink>
            <RouterLink to="/storage">Storage</RouterLink>
            <RouterLink to="/schedules">Schedules</RouterLink>
          </Flex>
        </Box>
      </Box>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}