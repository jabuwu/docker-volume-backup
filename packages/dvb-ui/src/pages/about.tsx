import Wrapper from '../components/wrapper';
import Title from '../components/title';
import React from 'react';
import { Text, Img, Flex, Box, Link } from '@chakra-ui/react';
import NextLink from 'next/link';

const gitCommit = process.env.NEXT_PUBLIC_GIT_COMMIT;
const gitDate = process.env.NEXT_PUBLIC_GIT_DATE;
export default function Index(): any {
  return (
    <Wrapper>
      <Title>About</Title>
      <Flex mt={ 16 } direction="column">
        <Box maxWidth="400px" mx="auto">
          <Img src="/images/logo.png" />
        </Box>
        { gitCommit ? <Box mx="auto" mt={ 2 }>
          <Text color="">Commit: <Text as="span" fontWeight="bold">{ gitCommit }</Text>{ gitDate ? ` (${gitDate})` : '' }</Text>
        </Box> : null }
        <Box mx="auto" mt={ 4 }>
          <Link href="https://github.com/jabuwu/docker-volume-backup" fontWeight="bold" fontSize="24px" target="_blank">GitHub</Link>
        </Box>
        <Text mx="auto" mt={ 16 } color="lightgray">This is free and unencumbered software released into the public domain.</Text>
        <Text mx="auto" mt={ 2 } color="lightgray">
          Cute whale, logo, and favicon created by <Link href="https://mordi.net" target="_blank" color="white">Mordi</Link> and licensed under <Link href="https://creativecommons.org/share-your-work/public-domain/cc0/" target="_blank" color="white">CC0</Link>.
        </Text>
        <Text mx="auto" mt={ 2 } color="lightgray">Attributions: <Link href="/attributions/frontend.html" target="_blank" color="white">Frontend</Link>, <Link href="/attributions/backend.html" target="_blank" color="white">Backend</Link></Text>
        <Text mx="auto" mt={ 16 } color="lightgray" textAlign="center">
          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        </Text>
      </Flex>
    </Wrapper>
  )
}