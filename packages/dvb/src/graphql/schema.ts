import { S3Bucket } from '../storage/s3';
import { Arg, buildSchemaSync, Mutation, Query, Resolver, Root, Subscription } from 'type-graphql';
import { Container } from '../docker/container';
import { Volume } from '../docker/volume';
import { context } from './context';
import { fromObservable } from './from-observable';
import { getStorage } from '../storage';
import { s3Buckets } from '../storage/s3';

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
  // S3 Buckets
  ///
  @Query(() => [S3Bucket]) async s3Buckets() {
    return s3Buckets.all();
  }
  @Query(() => S3Bucket, { nullable: true }) async s3Bucket(
    @Arg('alias', () => String) alias: string
  ) {
    return s3Buckets.findOne({ alias });
  }
  @Mutation(() => S3Bucket, { nullable: true }) addS3Bucket(
    @Arg('alias', () => String) alias: string,
    @Arg('name', () => String) name: string,
    @Arg('region', () => String) region: string,
    @Arg('accessKey', () => String) accessKey: string,
    @Arg('secretKey', () => String) secretKey: string,
    @Arg('prefix', () => String, { nullable: true }) prefix: string | undefined,
  ): S3Bucket | null {
    const storage = getStorage(alias);
    if (storage) {
      // TODO: return an error
      return null;
    }
    return s3Buckets.create({
      alias,
      name,
      region,
      accessKey,
      secretKey,
      prefix: prefix ?? '',
    });
  }
  @Mutation(() => Boolean) removeS3Bucket(
    @Arg('alias', () => String) alias: string
  ): boolean {
    return s3Buckets.del({ alias });
  }
}

export const schema = buildSchemaSync({
  resolvers: [ DvmResolver ],
  validate: false,
});