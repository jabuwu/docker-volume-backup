import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Box, Text } from '@chakra-ui/react';
import React, { useState } from 'react';

export default function BackupIntervalInput({ value, onChange }: { value: number, onChange: (value: number) => void }) {
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={ 3 }>
      <Text mb={ 2 } fontWeight="bold">Backup Frequency</Text>
      <NumberInput value={ value } onChange={ e => onChange(Number(e)) } min={ 1 } mt={ 2 }>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Text mt={ 2 }>Will backup every { value } { value === 1 ? 'hour' : 'hours' }.</Text>
    </Box>
  );
}