import { Box } from "@chakra-ui/react";

export default function Wrapper({ children }: { children: any }) {
  return (
    <Box mt={ 4 } mx="auto" maxW="1000px" w="100%">
      { children }
    </Box>
  )
}