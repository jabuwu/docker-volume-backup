import { Box, Img } from '@chakra-ui/react';

export default function HeaderImage() {
  return <Box mr={ 2 } className="logo" position="relative">
    <Img src="/images/header.png" height="64px" />
  </Box>;
}