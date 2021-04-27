import { Readable, Writable } from 'stream';
import { LocalStorage } from './local';
import { S3Bucket, s3Buckets, S3Storage } from './s3';
import { ObjectType, Field } from 'type-graphql';
import { assign, find } from 'lodash';
import { FtpServer, ftpServers, FtpStorage } from './ftp';

@ObjectType()
export class StorageBackupStat {
  @Field()
  size: number;

  @Field()
  modified: number;
}

@ObjectType()
export class StorageBackup {
  constructor(private inter: StorageInterface, data: Partial<StorageBackup>) {
    assign(this, data);
  }

  @Field()
  fileName: string;

  @Field(() => StorageBackupStat)
  async stat(): Promise<StorageBackupStat> {
    return this.inter.stat(this.fileName);
  }
}

export interface StorageInterface {
  write(fileName: string, stream: Readable): Promise<void>;
  read(fileName: string, stream: Writable): Promise<void>;
  del(fileName: string): Promise<void>;
  list(): Promise<StorageBackup[]>;
  stat(fileName: string): Promise<StorageBackupStat>;
}

export function getStorage(name: string): StorageInterface | null {
  if (name === 'local') {
    return new LocalStorage();
  }
  const s3Bucket = s3Buckets.findOne({ name });
  if (s3Bucket) {
    return new S3Storage(s3Bucket);
  }
  const ftpServer = ftpServers.findOne({ name });
  if (ftpServer) {
    return new FtpStorage(ftpServer);
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
        s3Bucket,
        interface: new S3Storage(s3Bucket),
      }));
    }
    for (const ftpServer of ftpServers.all()) {
      storages.push(new Storage({
        type: 'ftpServer',
        name: ftpServer.name,
        ftpServer,
        interface: new FtpStorage(ftpServer),
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
  type: 'local' | 's3Bucket' | 'ftpServer';

  @Field(() => String)
  name: string;

  @Field(() => S3Bucket, { nullable: true })
  s3Bucket?: S3Bucket;

  @Field(() => FtpServer, { nullable: true })
  ftpServer?: FtpServer;

  @Field(() => [StorageBackup])
  async backups(): Promise<StorageBackup[]> {
    return await this.interface.list();
  }

  interface: StorageInterface;
}