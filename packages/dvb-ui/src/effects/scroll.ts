import { useEffect, useState, useMemo } from 'react';
import { Box, ChakraProvider, Flex, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
export function useScroll() {
  const [ state, setState ] = useState(() => ({ x: window.pageXOffset, y: window.pageYOffset }));
  const handleScroll = useMemo(() => function(event: any) {
    setState({ x: window.pageXOffset, y: window.pageYOffset });
  }, []);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return [ state.x, state.y ];
}