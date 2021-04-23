import { Box, ChakraProvider, Flex, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useScroll } from '../effects/scroll';
import theme from '../theme';
export default function App({ Component, pageProps }) {
  const [ , scrollY ] = useScroll();
  const router = useRouter();
  const activeStyle = (path: string) => router.pathname === path ? { fontWeight: 'bold' as const, color: 'white' } : {};
  const RouterLink = ({ children, to }: { children: string, to: string }) => (
    <NextLink href={ to }>
      <Link ml={ 4 } my="auto" color="#ddd" style={{ textDecoration: 'none', ...activeStyle(to) }} _hover={{ color: 'white' }}>{ children }</Link>
    </NextLink>
  );
  return (
    <ChakraProvider theme={ theme }>
      <Box p={4} mx="auto" bg="#056aa0" position="sticky" top={ 0 } zIndex={ 1 } boxShadow={ `0px 0px ${Math.min(8, scrollY)}px rgba(0, 0, 0, 0.5)` }>
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