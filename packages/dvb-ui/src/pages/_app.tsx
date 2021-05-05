import '../../styles/global.css';
import { Box, ChakraProvider, Flex, Img, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import Alerts from '../components/alerts';
import theme from '../theme';
import { apolloClient } from '../apollo';
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import Head from 'next/head';
import HeaderImage from '../components/header-image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const activeStyle = (path: string) => ((router.pathname === '/' && path === '/') || (path !== '/' && router.pathname.startsWith(path))) ? { fontWeight: 'bold' as const, color: 'white' } : {};
  const RouterLink = ({ children, to }: { children: string, to: string }) => (
    <NextLink href={ to }>
      <Link ml={ 4 } my="auto" color="#ddd" style={{ textDecoration: 'none', ...activeStyle(to) }} _hover={{ color: 'white' }}>{ children }</Link>
    </NextLink>
  );
  return (
    <ChakraProvider theme={ theme }>
      <ApolloProvider client={ apolloClient }>
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#06cdff" />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <Box className="grid-container">
          <Box className="header">
            <Box p={ 2 } mx="auto" bg="#056aa0" position="sticky" top={ 0 } zIndex={ 1 }>
              <Box mx="auto" maxW="1000px" w="100%">
                <Flex>
                  {/* <Text fontWeight="extrabold" fontSize="sm" textAlign="center" mr={ 4 } transform="rotate(-10deg)" color="white" textShadow="1px 1px 1px black">Docker Volume<br />Backup</Text> */}
                  <HeaderImage />
                  <RouterLink to="/">Volumes</RouterLink>
                  <RouterLink to="/storage">Storage</RouterLink>
                  <RouterLink to="/schedules">Schedules</RouterLink>
                </Flex>
              </Box>
            </Box>
          </Box>
          <Box className="main">
            <Component {...pageProps} />
          </Box>
          <Box className="footer" bg="#056aa0" height="60px">
            <Flex mx="auto" maxW="1000px" w="100%" h="100%">
              <NextLink href="/about">
                <Link m="auto">
                  <Img src="/images/footer.png" height="30px" className="footer-image" />
                </Link>
              </NextLink>
            </Flex>
          </Box>
        </Box>
        <Alerts />
      </ApolloProvider>
    </ChakraProvider>
  )
}