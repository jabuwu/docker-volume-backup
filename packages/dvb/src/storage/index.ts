import { Readable, Writable } from 'stream';
import { LocalStorage } from './local';
import { S3Bucket, s3Buckets, S3Storage } from './s3';
import { ObjectType, Field } from 'type-graphql';
import { assign, find } from 'lodash';

@ObjectType()
export class StorageBackup {
  @Field()
  fileName: string;
}

export interface StorageInterface {
  write(fileName: string, stream: Readable): Promise<void>;
  read(fileName: string, stream: Writable): Promise<void>;
  del(fileName: string): Promise<void>;
  list(): Promise<StorageBackup[]>;
}

export function getStorage(name: string): StorageInterface | null {
  if (name === 'local') {
    return new LocalStorage();
  }
  const s3Bucket = s3Buckets.findOne({ name });
  if (s3Bucket) {
    return new S3Storage(s3Bucket);
  }
  return null;
}

@ObjectType()
export class Storage {
  static all() {
    const storages: Storage[] = [];
    storages.push(new Storage({
      type: 'local',
      name: 'local',
      interface: new LocalStorage(),
    }));
    for (const s3Bucket of s3Buckets.all()) {
      storages.push(new Storage({
        type: 's3Bucket',
        name: s3Bucket.name,
        s3Bucket: s3Bucket,
        interface: new S3Storage(s3Bucket),
      }));
    }
    return storages;
  }

  static get(name: string): Storage | null {
    const list = Storage.all();
    return find(list, { name }) || null;
  }

  constructor(data: Partial<Storage>) {
    assign(this, data);
  }

  @Field(() => String)
  type: 'local' | 's3Bucket';

  @Field(() => String)
  name: string;

  @Field(() => S3Bucket, { nullable: true })
  s3Bucket?: S3Bucket;

  @Field(() => [StorageBackup])
  async backups(): Promise<StorageBackup[]> {
    return await this.interface.list();
  }

  interface: StorageInterface;
}