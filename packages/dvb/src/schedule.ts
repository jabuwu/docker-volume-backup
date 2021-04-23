import { ObjectType, Field } from 'type-graphql';
import { DBStore } from './db';
import { context } from './graphql/context';
import { getStorage } from './storage';

@ObjectType()
export class Schedule {
  @Field()
  id: string;

  @Field()
  volume: string;

  @Field()
  storage: string;

  @Field()
  hours: number;

  lastUpdate: number;
}

export const schedules = new DBStore<Schedule>('schedules');

setInterval(async () => {
  const list = schedules.all();
  for (const schedule of list) {
    if (Date.now() > schedule.lastUpdate + schedule.hours * 60 * 60 * 1000) {
      schedules.update({ id: schedule.id }, { lastUpdate: Date.now() });
      const fileName = `${schedule.volume}-${Date.now()}.tgz`;
      const storageInstance = getStorage(schedule.storage);
      if (storageInstance) {
        try {
          await context.docker.exportVolume(schedule.volume, async (stream) => {
            await storageInstance.write(fileName!, stream);
          });
        } catch (err) {
          // TODO: report errors
          console.error(err);
        }
      }
    }
  }
}, 30000);