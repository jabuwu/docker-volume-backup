import { S3Bucket } from '../storage/s3';
import { Arg, buildSchemaSync, Mutation, Query, Resolver, Root, Subscription, Int } from 'type-graphql';
import { Container } from '../docker/container';
import { Volume, pinnedVolumes } from '../docker/volume';
import { context } from './context';
import { fromObservable } from './from-observable';
import { Storage, getStorage } from '../storage';
import { s3Buckets } from '../storage/s3';
import { Schedule, schedules } from '../schedule';
import { generate } from 'short-uuid';

@Resolver()
class DvmResolver {
  ////
  // Containers
  ///
  @Query(() => [Container]) async containers() {
    return await context.docker.getContainers();
  }
  @Subscription(() => Container, { subscribe: fromObservable(context.docker.containerAdded$) }) containerAdded(
    @Root() container: Container
  ): Container {
    return container;
  }
  @Subscription(() => Container, { subscribe: fromObservable(context.docker.containerRemoved$) }) containerRemoved(
    @Root() container: Container
  ): Container {
    return container;
  }

  ////
  // Volumes
  ///
  @Query(() => [Volume]) async volumes() {
    return await context.docker.getVolumes();
  }
  @Mutation(() => Boolean) async exportVolume(
    @Arg('volume', () => String) volume: string,
    @Arg('storage', () => String) storage: string,
    @Arg('fileName', () => String, { nullable: true }) fileName: string | undefined,
  ) {
    fileName = fileName || `${volume}.tgz`;
    const storageInstance = getStorage(storage);
    if (storageInstance) {
      try {
        await context.docker.exportVolume(volume, async (stream) => {
          await storageInstance.write(fileName!, stream);
        });
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
    return false;
  }
  @Mutation(() => Boolean) async importVolume(
    @Arg('volume', () => String) volume: string,
    @Arg('storage', () => String) storage: string,
    @Arg('fileName', () => String) fileName: string
  ) {
    const storageInstance = getStorage(storage);
    if (storageInstance) {
      try {
        await context.docker.importVolume(volume, async (stream) => {
          await storageInstance.read(fileName!, stream);
        });
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
    return false;
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
  @Subscription(() => Volume, { subscribe: fromObservable(context.docker.volumeAdded$) }) volumeAdded(
    @Root() volume: Volume
  ): Volume {
    return volume;
  }
  @Subscription(() => Volume, { subscribe: fromObservable(context.docker.volumeRemoved$) }) volumeRemoved(
    @Root() volume: Volume
  ): Volume {
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
  @Mutation(() => Boolean) removeSchedule(
    @Arg('id', () => String) id: string
  ): boolean {
    return schedules.del({ id });
  }

  ////
  // S3 Buckets
  ///
  @Query(() => [S3Bucket]) async s3Buckets() {
    return s3Buckets.all();
  }
  @Query(() => S3Bucket, { nullable: true }) async s3Bucket(
    @Arg('name', () => String) name: string
  ) {
    return s3Buckets.findOne({ name });
  }
  @Mutation(() => S3Bucket, { nullable: true }) addS3Bucket(
    @Arg('name', () => String) name: string,
    @Arg('bucket', () => String) bucket: string,
    @Arg('region', () => String) region: string,
    @Arg('accessKey', () => String) accessKey: string,
    @Arg('secretKey', () => String) secretKey: string,
    @Arg('prefix', () => String, { nullable: true }) prefix: string | undefined,
  ): S3Bucket | null {
    const storage = getStorage(name);
    if (storage) {
      // TODO: return an error
      return null;
    }
    return s3Buckets.create({
      name,
      bucket,
      region,
      accessKey,
      secretKey,
      prefix: prefix ?? '',
    });
  }
  @Mutation(() => Boolean) removeS3Bucket(
    @Arg('name', () => String) name: string
  ): boolean {
    return s3Buckets.del({ name });
  }
}

export const schema = buildSchemaSync({
  resolvers: [ DvmResolver ],
  validate: false,
});