import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Box, Text, Select, Flex, NumberInputProps, Button, ButtonGroup } from '@chakra-ui/react';
import { StyleProps } from '@chakra-ui/system';
import React, { useEffect, useMemo, useState } from 'react';
import { BackupFrequency as ServerBackupFrequency } from '../generated/graphql';
import { useObjectArray } from '../utility/use-object-array';
import { clone } from 'lodash';
import dayjs from 'dayjs';

const utcOffset = dayjs().tz(dayjs.tz.guess()).utcOffset();
const adjust = {
  hour: Math.floor(utcOffset / 60),
  minute: Math.abs(utcOffset) % 60,
};

type DayOfWeekArray = [ boolean, boolean, boolean, boolean, boolean, boolean, boolean ];
class BackupFrequency {
  static fromServer(obj: ServerBackupFrequency): BackupFrequency {
    const frequency = new BackupFrequency();
    if (obj.interval) {
      frequency.type = 'interval';
      frequency.interval = obj.interval.interval;
      frequency.intervalUnit = obj.interval.unit as BackupFrequency['intervalUnit'];
    } else if (obj.weekday) {
      const adjustment = BackupFrequency.timezoneAdjust({
        enabled: obj.weekday.enabled as DayOfWeekArray,
        hour: obj.weekday.at.hour,
        minute: obj.weekday.at.minute,
      }, adjust.hour, adjust.minute);
      frequency.type = 'weekday';
      frequency.weekdayEnabled = adjustment.enabled;
      frequency.weekdayAt = {
        hour: adjustment.hour,
        minute: adjustment.minute,
      }
    }
    return frequency;
  }
  static toServer(obj: BackupFrequency): ServerBackupFrequency {
    if (obj.type === 'interval') {
      return {
        interval: {
          interval: obj.interval,
          unit: obj.intervalUnit,
        },
      };
    } else {
      const adjustment = BackupFrequency.timezoneAdjust({
        enabled: obj.weekdayEnabled,
        hour: obj.weekdayAt.hour,
        minute: obj.weekdayAt.minute,
      }, -adjust.hour, -adjust.minute);
      return {
        weekday: {
          enabled: adjustment.enabled,
          at: {
            hour: adjustment.hour,
            minute: adjustment.minute,
          },
        },
      };
    }
  }
  static timezoneAdjust(from: { enabled: DayOfWeekArray, hour: number, minute: number }, adjustHours: number, adjustMinutes: number) {
    let adjustDays = 0;
    let newMinute = from.minute + adjustMinutes;
    while (newMinute < 0) {
      adjustHours -= 1;
      newMinute += 60;
    }
    while (newMinute >= 60) {
      adjustHours += 1;
      newMinute -= 60;
    }
    let newHour = from.hour + adjustHours;
    while (newHour < 0) {
      adjustDays -= 1;
      newHour += 24;
    }
    while (newHour >= 24) {
      adjustDays += 1;
      newHour -= 24;
    }
    let newEnabled = clone(from.enabled);
    while (adjustDays < 0) {
      newEnabled = [ ...newEnabled.slice(1), newEnabled[0] ] as DayOfWeekArray;
      adjustDays++;
    }
    while (adjustDays > 0) {
      newEnabled = [ newEnabled[6], ...newEnabled.slice(0, 6) ] as DayOfWeekArray;
      adjustDays--;
    }
    return {
      enabled: newEnabled,
      hour: newHour,
      minute: newMinute,
    };
  }

  type: 'interval' | 'weekday' = 'interval';

  interval: number = 24;
  intervalUnit: 'minutes' | 'hours' | 'days' = 'hours';

  weekdayEnabled: DayOfWeekArray = [ false, false, false, false, false, false, false ];
  weekdayAt: { hour: number; minute: number } = { hour: 4, minute: 0 };
}

const NumberIn = (data: Omit<NumberInputProps, 'onChange'> & { stepper?: boolean, onChange: (value: number ) => void }) => {
  const { stepper, value, onChange, ...props } = data;
  return (
    <NumberInput value={ value } onChange={ e => onChange(Number(e)) } { ...props }>
      <NumberInputField p={ stepper ? '0px 32px 0px 16px' : '0px 8px' } />
      { stepper === true ?
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      : null }
    </NumberInput>
  );
};
const s = (n: number) => n === 1 ? '' : 's';
const DayOfWeekSelect = (props: Omit<StyleProps, 'apply'> & { value: DayOfWeekArray, onChange: (value: DayOfWeekArray) => void }) => {
  const { value, onChange, ...styleProps } = props;
  const names = [ 'Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa' ];
  const buttonStyle = {
    minWidth: '0px',
    p: '8px',
    fontSize: '12px',
  };
  const selected = {
    colorScheme: 'green',
    variant: 'solid',
  };
  const deselected = {
    colorScheme: 'red',
    variant: 'ghost',
  };
  return (
    <Box { ...styleProps }>
      <ButtonGroup isAttached>
        { names.map((name, i) => (
          <Button key={ name } { ...buttonStyle } { ...(value[i] ? selected : deselected) } onClick={
            () => onChange(value.map((item, j) => i === j ? !item : item) as DayOfWeekArray)
          }>{ name }</Button>
        )) }
      </ButtonGroup>
    </Box>
  );
}
const TimeSelect = ({ value, onChange }: { value: { hour: number, minute: number }, onChange: (value: { hour: number, minute: number }) => void}) => {
  const [ minuteFocused, setMinuteFocused ] = useState(false);
  const minuteDisplay = useMemo(() => {
    if (!minuteFocused && value.minute < 10) {
      return `0${value.minute}`;
    }
    return value.minute;
  }, [ value, minuteFocused ]);
  return <>
    <NumberIn value={ value.hour } onChange={ e => onChange({ hour: e, minute: value.minute }) } min={ 0 } max={ 23 } ml={ 2 } style={{ padding: '0px 4px' }} />
    <Text my="auto">:</Text>
    <NumberIn value={ minuteDisplay } onChange={ e => onChange({ hour: value.hour, minute: e }) } onFocus={ () => setMinuteFocused(true) }  onBlur={ () => setMinuteFocused(false) } min={ 0 } max={ 59 } style={{ padding: '0px 4px' }} />
  </>;
};

export default function BackupIntervalInput({ value, onChange }: { value: ServerBackupFrequency[], onChange: (value: ServerBackupFrequency[]) => void}) {
  const {
    value: frequencies,
    add: addFrequency,
    remove: removeFrequency,
    update: updateFrequency,
    set: setFrequencies
  } = useObjectArray([] as BackupFrequency[], (value) => {
    onChange(value.map(item => BackupFrequency.toServer(item)));
  });
  const [ first, setFirst ] = useState(true);
  useEffect(() => {
    setFrequencies(value.map(item => BackupFrequency.fromServer(item)), { silent: !first });
    if (first) {
      setFirst(false);
    }
  }, [ value ]);
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={ 3 }>
      <Text mb={ 2 } fontWeight="bold">Backup Frequency</Text>
      { frequencies.map((frequency, i) => (
        <Flex key={ i } mb={ 2 }>
          <Select value={ frequency.type } onChange={ e => updateFrequency(i, 'type', e.target.value as BackupFrequency['type']) } w="220px">
            <option value="interval">Every</option>
            <option value="weekday">On</option>
          </Select>
          { frequency.type === 'interval' ?
            <>
              <NumberIn value={ frequency.interval } onChange={ e => updateFrequency(i, 'interval', Number(e)) } min={ 1 } mx={ 2 } stepper={ true } />
              <Select value={ frequency.intervalUnit } onChange={ e => updateFrequency(i, 'intervalUnit', e.target.value as BackupFrequency['intervalUnit']) }>
                <option value="minutes">Minute{ s(frequency.interval) }</option>
                <option value="hours">Hour{ s(frequency.interval) }</option>
                <option value="days">Day{ s(frequency.interval) }</option>
              </Select>
            </>
          : null }
          { frequency.type === 'weekday' ?
            <>
              <DayOfWeekSelect value={ frequency.weekdayEnabled } onChange={ e => updateFrequency(i, 'weekdayEnabled', e) } my="auto" mx={ 2 } />
              <Text my="auto">At</Text>
              <TimeSelect value={ frequency.weekdayAt } onChange={ e => updateFrequency(i, 'weekdayAt', e) } />
            </>
          : null }
          <Button variant="outline" colorScheme="red" ml={ 2 } onClick={ () => removeFrequency(i) }><MinusIcon /></Button>
        </Flex>
      )) }
      <Flex>
        <Button size="sm" variant="outline" colorScheme="green" w="100%" onClick={ () => addFrequency(new BackupFrequency()) }><AddIcon /></Button>
      </Flex>
    </Box>
  );
}