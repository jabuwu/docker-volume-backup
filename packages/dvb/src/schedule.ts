import { ObjectType, Field } from 'type-graphql';
import { DBStore } from './db';
import { context } from './graphql/context';
import { getStorage } from './storage';
import { applyFormat } from './utility/apply-format';
import { directoryToName } from './utility/directory-to-name';

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

  @Field()
  lastUpdate: number;

  @Field()
  stopContainers: boolean;

  @Field()
  fileNameFormat: string;
}

export const schedules = new DBStore<Schedule>('schedules');
schedules.migrate(1, item => {
  item.stopContainers = false;
});
schedules.migrate(2, item => {
  item.fileNameFormat = '${volumeName}--${dateNow}.tgz';
});

setInterval(async () => {
  const list = schedules.all();
  for (const schedule of list) {
    if (Date.now() > schedule.lastUpdate + schedule.hours * 60 * 60 * 1000) {
      schedules.update({ id: schedule.id }, { lastUpdate: Date.now() });
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