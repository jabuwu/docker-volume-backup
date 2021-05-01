import { ObjectType, Field, Int } from 'type-graphql';
import { Readable, Writable } from 'stream';
import { StorageInterface, StorageBackup, StorageBackupStat } from '.';
import { DBStore } from '../db';
import * as ftp from 'basic-ftp';
import { omit } from 'lodash';
import path from 'path';

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
      const fullPath = `${this.server.prefix}${fileName}`;
      console.log(fullPath);
      await client.ensureDir(path.dirname(fullPath));
      await client.uploadFrom(stream, path.basename(fullPath));
    } finally {
      client.close();
    }
  }
  async read(fileName: string, stream: Writable) {
    const client = await this.client();
    try {
      const fullPath = `${this.server.prefix}${fileName}`;
      await client.downloadTo(stream, fullPath);
    } finally {
      client.close();
    }
  }
  async del(fileName: string) {
    const client = await this.client();
    try {
      const fullPath = `${this.server.prefix}${fileName}`;
      await client.remove(fullPath);
    } finally {
      client.close();
    }
  }
  async list(): Promise<StorageBackup[]> {
    const client = await this.client();
    try {
      const prefix = `${await client.pwd()}${this.server.prefix}`;
      const prefixSplit = prefix.split('/');
      const prefixDir = prefixSplit.slice(0, prefixSplit.length - 1).join('/') + '/';
      const backups: StorageBackup[] = [];
      const listDir = async (dir: string) => {
        const items = await client.list(dir);
        for (const item of items) {
          const fullName = path.join(dir, item.name);
          if (fullName.startsWith(prefix)) {
            if (item.isDirectory) {
              await listDir(path.join(dir, item.name));
            }
            if (item.isFile) {
              backups.push(new StorageBackup(this, { fileName: fullName.substr(prefix.length) }));
            }
          }
        }
      }
      await listDir(prefixDir);
      return backups;
    } finally {
      client.close();
    }
  }
  async stat(fileName: string): Promise<StorageBackupStat> {
    const client = await this.client();
    try {
      const fullPath = `${this.server.prefix}${fileName}`;
      return {
        size: await client.size(fullPath),
        modified: await (await client.lastMod(fullPath)).getTime(),
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
