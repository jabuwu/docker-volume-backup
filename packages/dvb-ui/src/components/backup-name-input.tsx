import { Box, Button, Code, Collapse, Divider, Input, InputGroup, InputRightElement, Link, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from '@chakra-ui/react';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { noAutofill } from '../utility/no-autofill';
import { applyFormat } from '../utility/apply-format';
import { QuestionIcon } from '@chakra-ui/icons';

export default function BackupNameInput({ value, onChange, dictionary }: { value: string, onChange: (value: string) => void, dictionary?: { [ key: string ]: string } }) {
  const [ showHelp, setShowHelp ] = useState(false);
  const now = useMemo(() => Date.now(), []);
  const fullDictionary = useMemo(() => ({
    dateNow: String(now),
    ...dictionary,
  }), [ dictionary ]);
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={ 3 }>
      <Text mb={ 2 } fontWeight="bold">Backup Filename Format</Text>
      <InputGroup>
        <Input { ...noAutofill } value={ value } onChange={ e => onChange(e.target.value) } />
        <InputRightElement width="3rem">
          <Tooltip label="Formatting Help">
            <Button size="sm" onClick={ () => setShowHelp(value => !value )}>
              <QuestionIcon />
            </Button>
          </Tooltip>
        </InputRightElement>
      </InputGroup>
      <Box mt={ 2 }>
        <Text as="span">Preview:&nbsp;</Text>
        <Tooltip label={ applyFormat(value, fullDictionary, now) }>
          <Code>{ applyFormat(value, fullDictionary, now) }</Code>
        </Tooltip>
      </Box>
      <Collapse in={ showHelp } animateOpacity>
        <Divider my={ 4 } />
        <Text fontSize="xl">Formatting Help</Text>
        <Box m={ 2 }>
          <Text>Using descriptive filenames will help more easily find the backup you are looking for. Customize the filename above by entering raw text or by using the formatting rules below:</Text>
          <Table size="sm" mt={ 2 }>
            <Thead>
              <Tr>
                <Th>
                  Format
                </Th>
                <Th>
                  Description
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <Code>{ '${volumeName}' }</Code>
                </Td>
                <Td>
                  Name of the selected volume.
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Code>{ '${dateNow}' }</Code>
                </Td>
                <Td>
                  Epoch timestamp acquired from JavaScript's <Link href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now" target="_blank"><Code>Date.now()</Code></Link>.
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Code>{ '${date:FORMAT}' }</Code>
                </Td>
                <Td>
                  Date formatted by <Link href="https://day.js.org/docs/en/display/format" target="_blank"><Code>dayjs().format()</Code></Link> function. Replace <Code>FORMAT</Code> with the desired formatted date. For example: <Code>{ '${date:YYYY-MM-DD}' }</Code>.
                </Td>
              </Tr>
            </Tbody>
          </Table>
          <Text mt={ 2 }>Create new directories by using <Code>/</Code> in the format. For example: <Code>{ '${volumeName}/backup-${date:YYYY-MM-DD}.tgz' }</Code>.</Text>
        </Box>
      </Collapse>
    </Box>
  );
}