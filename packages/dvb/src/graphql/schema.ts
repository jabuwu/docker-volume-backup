import { Arg, buildSchemaSync, Mutation, Query, Resolver, Root, Subscription, Int } from 'type-graphql';
import { Container } from '../docker/container';
import { Volume, pinnedVolumes } from '../docker/volume';
import { context } from './context';
import { fromObservable } from './from-observable';
import { Storage, getStorage } from '../storage';
import { s3Buckets } from '../storage/s3';
import { Schedule, schedules } from '../schedule';
import { generate } from 'short-uuid';
import path from 'path';
import { assign, cloneDeep, pickBy } from 'lodash';
import { downloadWriteStream } from '../download';
import { Task, getSubject } from '../tasks';
import { filter } from 'rxjs/operators';
import { ftpServers } from '../storage/ftp';

function validateFileName(fileName: string) {
  if (path.isAbsolute(fileName)) {
    throw new Error('Invalid storage file name.');
  }
  fileName = fileName.split('\\').join('/');
  const dirs = fileName.split('/');
  for (const dir of dirs) {
    if (dir === '..') {
      throw new Error('Invalid storage file name.');
    }
  }
}

@Resolver()
class DvmResolver {
  ////
  // Containers
  ///
  @Query(() => [Container]) async containers() {
    return await context.docker.getContainers();
  }

  ////
  // Volumes
  ///
  @Query(() => [Volume]) async volumes() {
    return await context.docker.getVolumes();
  }
  @Mutation(() => String) async exportVolume(
    @Arg('volume', () => String) volume: string,
    @Arg('storage', () => String) storage: string,
    @Arg('fileName', () => String, { nullable: true }) fileName: string | undefined,
  ) {
    fileName = fileName || `${volume}.tgz`;
    validateFileName(fileName);
    const storageInstance = getStorage(storage);
    if (storageInstance) {
      return new Task(async (update, complete) => {
        update({ status: 'Preparing...' });
        await context.docker.exportVolume(volume, async (stream) => {
          await storageInstance.write(fileName!, stream);
        }, (progress) => {
          update({ status: 'Backing up...', progress });
        });
        complete();
      }).id;
    }
    throw new Error('Storage does not exist: ' + storage);
  }
  @Mutation(() => String) async importVolume(
    @Arg('volume', () => String) volume: string,
    @Arg('storage', () => String) storage: string,
    @Arg('fileName', () => String) fileName: string
  ) {
    validateFileName(fileName);
    const storageInstance = getStorage(storage);
    if (storageInstance) {
      return new Task(async (update, complete) => {
        update({ status: 'Getting file info...' });
        const stat = await storageInstance.stat(fileName);
        update({ status: 'Preparing...' });
        await context.docker.importVolume(volume, stat.size, async (stream) => {
          await storageInstance.read(fileName!, stream);
        }, (progress) => {
          update({ status: 'Restoring...', progress });
        });
        complete();
      }).id;
    }
    throw new Error('Storage does not exist: ' + storage);
  }
  @Mutation(() => Boolean) pinVolume(
    @Arg('volume', () => String) volume: string,
    @Arg('pinned', () => Boolean) pinned: boolean,
  ): boolean {
    if (pinned) {
      pinnedVolumes.add(volume);
    } else {
      return pinnedVolumes.remove(volume);
    }
    return true;
  }
  @Subscription(() => Volume, { subscribe: fromObservable(context.docker.volumeCreate$) }) volumeCreated(
    @Root() volume: Volume
  ): Volume {
    return volume;
  }
  @Subscription(() => String, { subscribe: fromObservable(context.docker.volumeDestroy$) }) volumeDestroyed(
    @Root() volume: string
  ): string {
    return volume;
  }

  ////
  // Storage
  ///
  @Query(() => [Storage]) allStorage() {
    return Storage.all();
  }
  @Query(() => Storage, { nullable: true }) storage(
    @Arg('name', () => String) name: string,
  ) {
    return Storage.get(name);
  }
  @Mutation(() => Boolean) async removeStorage(
    @Arg('name', () => String) name: string,
  ): Promise<boolean> {
    if (s3Buckets.del({ name })) {
      return true;
    }
    if (ftpServers.del({ name })) {
      return true;
    }
    return false;
  }
  @Mutation(() => Boolean) async deleteBackup(
    @Arg('storage', () => String) storageName: string,
    @Arg('fileName', () => String) fileName: string,
  ): Promise<boolean> {
    validateFileName(fileName);
    const storage = getStorage(storageName);
    if (storage) {
      await storage.del(fileName);
      return true;
    }
    return true;
  }
  @Mutation(() => String, { nullable: true }) async downloadBackup(
    @Arg('storage', () => String) storageName: string,
    @Arg('fileName', () => String) fileName: string,
  ): Promise<string | null> {
    validateFileName(fileName);
    const storage = getStorage(storageName);
    if (storage) {
      const { stream, fileName: downloadFileName } = await downloadWriteStream(fileName);
      await storage.read(fileName, stream);
      stream.end();
      return `/download/${downloadFileName}`;
    }
    return null;
  }

  ///
  // Schedules
  ///
  @Query(() => [Schedule]) async schedules() {
    return schedules.all();
  }
  @Query(() => Schedule, { nullable: true }) async schedule(
    @Arg('id', () => String) id: string
  ) {
    return schedules.findOne({ id });
  }
  @Mutation(() => Schedule, { nullable: true }) addSchedule(
    @Arg('volume', () => String) volume: string,
    @Arg('storage', () => String) storage: string,
    @Arg('hours', () => Int) hours: number,
  ): Schedule | null {
    return schedules.create({
      id: generate(),
      volume,
      storage,
      hours,
      lastUpdate: new Date().getTime()
    });
  }
  @Mutation(() => Schedule, { nullable: true }) updateSchedule(
    @Arg('id', () => String) id: string,
    @Arg('volume', () => String, { nullable: true }) volume: string | undefined,
    @Arg('storage', () => String, { nullable: true }) storage: string | undefined,
    @Arg('hours', () => Int, { nullable: true }) hours: number | undefined,
  ): Schedule | null {
    const schedule = cloneDeep(schedules.findOne({ id }));
    if (!schedule) {
      return null;
    }
    assign(schedule, pickBy({
      volume,
      storage,
      hours,
    }, o => o !== undefined));
    schedules.update({ id }, schedule);
    return schedule;
  }
  @Mutation(() => Boolean) removeSchedule(
    @Arg('id', () => String) id: string
  ): boolean {
    return schedules.del({ id });
  }

  ////
  // S3 Buckets
  ///
  @Mutation(() => Storage, { nullable: true }) addS3Bucket(
    @Arg('name', () => String) name: string,
    @Arg('bucket', () => String) bucket: string,
    @Arg('region', () => String) region: string,
    @Arg('accessKey', () => String) accessKey: string,
    @Arg('secretKey', () => String) secretKey: string,
    @Arg('prefix', () => String, { nullable: true }) prefix: string | undefined,
  ): Storage | null {
    const storage = getStorage(name);
    if (storage) {
      // TODO: return an error
      return null;
    }
    const bucketInfo = s3Buckets.create({
      name,
      bucket,
      region,
      accessKey,
      secretKey,
      prefix: prefix ?? '',
    });
    return Storage.get(bucketInfo.name);
  }
  @Mutation(() => Storage, { nullable: true }) updateS3Bucket(
    @Arg('name', () => String) name: string,
    @Arg('bucket', () => String, { nullable: true }) bucket: string | undefined,
    @Arg('region', () => String, { nullable: true }) region: string | undefined,
    @Arg('accessKey', () => String, { nullable: true }) accessKey: string | undefined,
    @Arg('secretKey', () => String, { nullable: true }) secretKey: string | undefined,
    @Arg('prefix', () => String, { nullable: true }) prefix: string | undefined,
  ): Storage | null {
    const bucketInfo = cloneDeep(s3Buckets.findOne({ name }));
    if (!bucketInfo) {
      return null;
    }
    assign(bucketInfo, pickBy({
      bucket,
      region,
      accessKey,
      secretKey,
      prefix,
    }, o => o !== undefined));
    s3Buckets.update({ name }, bucketInfo);
    return Storage.get(bucketInfo.name);
  }

  ////
  // FTP Servers
  ///
  @Mutation(() => Storage, { nullable: true }) addFtpServer(
    @Arg('name', () => String) name: string,
    @Arg('host', () => String) host: string,
    @Arg('port', () => Int) port: number,
    @Arg('user', () => String) user: string,
    @Arg('password', () => String) password: string,
    @Arg('secure', () => Boolean) secure: boolean,
    @Arg('prefix', () => String, { nullable: true }) prefix: string | undefined,
  ): Storage | null {
    const storage = getStorage(name);
    if (storage) {
      // TODO: return an error
      return null;
    }
    const serverInfo = ftpServers.create({
      name,
      host,
      port,
      user,
      password,
      secure,
      prefix: prefix ?? '',
    });
    return Storage.get(serverInfo.name);
  }
  @Mutation(() => Storage, { nullable: true }) updateFtpServer(
    @Arg('name', () => String) name: string,
    @Arg('host', () => String, { nullable: true }) host: string | undefined,
    @Arg('port', () => Int, { nullable: true }) port: number | undefined,
    @Arg('user', () => String, { nullable: true }) user: string | undefined,
    @Arg('password', () => String, { nullable: true }) password: string | undefined,
    @Arg('secure', () => Boolean, { nullable: true }) secure: boolean | undefined,
    @Arg('prefix', () => String, { nullable: true }) prefix: string | undefined,
  ): Storage | null {
    const serverInfo = cloneDeep(ftpServers.findOne({ name }));
    if (!serverInfo) {
      return null;
    }
    assign(serverInfo, pickBy({
      host,
      port,
      user,
      password,
      secure,
      prefix,
    }, o => o !== undefined));
    ftpServers.update({ name }, serverInfo);
    return Storage.get(serverInfo.name);
  }

  ////
  // Tasks
  ///
  @Subscription(() => Task, { subscribe: (_, args) => { return fromObservable(getSubject(args.id).pipe(filter(item => item.status !== '')))() } }) taskUpdated(
    @Arg('id', () => String) _id: string,
    @Root() task: Task
  ): Task {
    return task;
  }
}

export const schema = buildSchemaSync({
  resolvers: [ DvmResolver ],
  validate: false,
});