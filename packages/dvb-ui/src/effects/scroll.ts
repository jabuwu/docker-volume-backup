import { useEffect, useState, useMemo } from 'react';
import { Box, ChakraProvider, Flex, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
export function useScroll() {
  const currentState = () => (typeof window === 'undefined' ? { x: 0, y: 0 } : { x: window.pageXOffset, y: window.pageYOffset });
  const [ state, setState ] = useState(currentState);
  const handleScroll = useMemo(() => function(event: any) {
    setState(currentState());
  }, []);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return [ state.x, state.y ];
}