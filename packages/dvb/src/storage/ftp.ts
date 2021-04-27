import { ObjectType, Field, Int } from 'type-graphql';
import { Readable, Writable } from 'stream';
import { StorageInterface, StorageBackup, StorageBackupStat } from '.';
import { DBStore } from '../db';
import * as ftp from 'basic-ftp';
import { omit } from 'lodash';

export class FtpStorage implements StorageInterface {
  constructor(private server: FtpServer) {
  }
  private async client() {
    const client = new ftp.Client();
    await client.access(omit(this.server, [ 'name', 'prefix' ]));
    return client;
  }
  async write(fileName: string, stream: Readable) {
    const client = await this.client();
    try {
      await client.uploadFrom(stream, fileName);
    } finally {
      client.close();
    }
  }
  async read(fileName: string, stream: Writable) {
    const client = await this.client();
    try {
      await client.downloadTo(stream, fileName);
    } finally {
      client.close();
    }
  }
  async del(fileName: string) {
    const client = await this.client();
    try {
      await client.remove(fileName);
    } finally {
      client.close();
    }
  }
  async list(): Promise<StorageBackup[]> {
    const client = await this.client();
    try {
      return (await client.list()).map(item => new StorageBackup(this, { fileName: item.name }));
    } finally {
      client.close();
    }
  }
  async stat(fileName: string): Promise<StorageBackupStat> {
    const client = await this.client();
    try {
      return {
        size: await client.size(fileName),
        modified: await (await client.lastMod(fileName)).getTime(),
      };
    } finally {
      client.close();
    }
  }
}

@ObjectType()
export class FtpServer {
  @Field()
  name: string;

  @Field()
  host: string;

  @Field(() => Int)
  port: number;

  @Field()
  user: string;

  @Field()
  secure: boolean;

  @Field()
  prefix: string;

  password: string;
}

export const ftpServers = new DBStore<FtpServer>('ftpServers');
