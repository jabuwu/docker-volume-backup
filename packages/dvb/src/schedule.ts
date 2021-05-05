import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ObjectType, Field, Int, InputType, Float } from 'type-graphql';
import { DBStore } from './db';
import { context } from './graphql/context';
import { getStorage } from './storage';
import { applyFormat } from './utility/apply-format';
import { directoryToName } from './utility/directory-to-name';
import { assign } from 'lodash';

dayjs.extend(utc);
dayjs.extend(timezone);

@ObjectType() @InputType('BackupFrequencyIntervalInput')
export class BackupFrequencyInterval {
  static validate(obj: BackupFrequencyInterval) {
    if (obj.interval < 1) {
      throw new Error('Frequency interval must be greater than or equal to 1.');
    }
    if (obj.unit !== 'minutes' && obj.unit !== 'hours' && obj.unit !== 'days') {
      throw new Error('Frequency unit must be one of: "minutes", "hours", "days"');
    }
  }

  @Field(() => Int)
  interval: number;

  @Field(() => String)
  unit: 'minutes' | 'hours' | 'days';
}

@ObjectType() @InputType('BackupFrequencyWeekdayAtInput')
export class BackupFrequencyWeekdayAt {
  static validate(obj: BackupFrequencyWeekdayAt) {
    if (obj.hour < 0) {
      throw new Error('Frequency hour must be greater than or equal to 0.');
    }
    if (obj.hour > 23) {
      throw new Error('Frequency hour must be less than or equal to 23.');
    }
    if (obj.minute < 0) {
      throw new Error('Frequency minute must be greater than or equal to 0.');
    }
    if (obj.minute > 59) {
      throw new Error('Frequency minute must be less than or equal to 59.');
    }
  }

  @Field(() => Int)
  hour: number;

  @Field(() => Int)
  minute: number;
}

@ObjectType() @InputType('BackupFrequencyWeekdayInput')
export class BackupFrequencyWeekday {
  static validate(obj: BackupFrequencyWeekday) {
    if (obj.enabled.length !== 7) {
      throw new Error('Frequency weekdays enabled must have exactly 7 items.');
    }
    for (const item of obj.enabled) {
      if (typeof item !== 'boolean') {
        throw new Error('All frequency weekday enabled must be booleans.');
      }
    }
    BackupFrequencyWeekdayAt.validate(obj.at);
  }

  @Field(() => [Boolean])
  enabled: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];

  @Field(() => BackupFrequencyWeekdayAt)
  at: BackupFrequencyWeekdayAt;
}

@ObjectType() @InputType('BackupFrequencyInput')
export class BackupFrequency {
  static validateMany(arr: BackupFrequency[]) {
    for (const item of arr) {
      BackupFrequency.validate(item);
    }
  }
  static validate(obj: BackupFrequency) {
    if (obj.interval && obj.weekday) {
      throw new Error('Backup frequency must have either "interval" or "weekday" set, but not both.');
    } else if (obj.interval) {
      BackupFrequencyInterval.validate(obj.interval);
    } else if (obj.weekday) {
      BackupFrequencyWeekday.validate(obj.weekday);
    } else {
      throw new Error('Backup frequency must have either "interval" or "weekday" set.');
    }
  }

  @Field(() => BackupFrequencyInterval, { nullable: true })
  interval?: BackupFrequencyInterval;

  @Field(() => BackupFrequencyWeekday, { nullable: true })
  weekday?: BackupFrequencyWeekday;
}

function calculateNextBackupTime(schedule: Schedule): number | undefined {
  const startTime = schedule.lastBackupTime ?? schedule.createdTime;
  let result: number | undefined = undefined;
  for (const frequency of schedule.frequencies) {
    let time: number | undefined = undefined;
    if (frequency.interval) {
      let multiplier = 1000 * 60 * 60 * 24 * 365;
      switch (frequency.interval.unit) {
        case 'minutes': multiplier = 1000 * 60; break;
        case 'hours': multiplier = 1000 * 60 * 60; break;
        case 'days': multiplier = 1000 * 60 * 60 * 24; break;
      }
      time = startTime + frequency.interval.interval * multiplier;
    } else if (frequency.weekday) {
      const checkTime = (dayOfWeek: number) => {
        if (frequency.weekday!.enabled[dayOfWeek % 7]) {
          const check = dayjs(startTime).tz('UTC').day(dayOfWeek).hour(frequency.weekday!.at.hour).minute(frequency.weekday!.at.minute).second(0).millisecond(0).toDate().getTime();
          if (check > startTime) {
            if (!time || check < time) {
              time = check;
            }
          }
        }
      }
      const dayOfWeek = dayjs().tz('UTC').day();
      for (let i = dayOfWeek; i <= dayOfWeek + 7; ++i) {
        checkTime(i);
      }
    }
    if (time) {
      if (!result) {
        result = time;
      } else if (time < result) {
        result = time;
      }
    }
  }
  return result;
}

@ObjectType()
export class Schedule {
  @Field()
  id: string;

  @Field()
  volume: string;

  @Field()
  storage: string;

  @Field(() => Float)
  createdTime: number;

  @Field(() => Float, { nullable: true })
  lastBackupTime?: number;

  @Field(() => Float, { nullable: true })
  nextBackupTime?(): number | undefined {
    return calculateNextBackupTime(this);
  }

  @Field()
  stopContainers: boolean;

  @Field()
  fileNameFormat: string;

  @Field(() => [BackupFrequency])
  frequencies: BackupFrequency[];
}

export const schedules = new DBStore<Schedule>('schedules');
schedules.migrate(1, item => {
  item.stopContainers = false;
});
schedules.migrate(2, item => {
  item.fileNameFormat = '${volumeName}--${dateNow}.tgz';
});
schedules.migrate(3, item => {
  item.frequencies = [
    {
      interval: {
        interval: item.hours,
        unit: 'hours',
      },
    }
  ]
  delete item['hours'];
  item.createdTime = item.lastUpdate;
  item.lastBackupTime = item.lastUpdate;
  delete item['lastUpdate'];
});

setInterval(async () => {
  const list = schedules.all();
  for (const schedule of list) {
    const nextBackup = assign(new Schedule(), schedule).nextBackupTime!();
    if (nextBackup && Date.now() > nextBackup) {
      schedules.update({ id: schedule.id }, { lastBackupTime: Date.now() });
      const now = Date.now();
      const fileName = applyFormat(schedule.fileNameFormat, {
        volumeName: directoryToName(schedule.volume),
        dateNow: String(now),
      }, now);
      const storageInstance = getStorage(schedule.storage);
      if (storageInstance) {
        try {
          let stoppedContainers: string[] = [];
          if (schedule.stopContainers) {
            stoppedContainers = await context.docker.stopVolumeContainers(schedule.volume);
          }
          await context.docker.exportVolume(schedule.volume, async (stream) => {
            await storageInstance.write(fileName!, stream);
          });
          if (schedule.stopContainers && stoppedContainers.length > 0) {
            await context.docker.startVolumeContainers(schedule.volume, stoppedContainers);
          }
        } catch (err) {
          // TODO: report errors
          console.error(err);
        }
      }
    }
  }
}, 30000);