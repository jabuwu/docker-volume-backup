import { StorageInterface, StorageBackup, StorageBackupStat } from '.';
import { access, createReadStream, createWriteStream, unlink } from 'fs-extra';
import { Readable, Writable } from 'stream';
import { constants, ensureDir, stat } from 'fs-extra';
import klaw from 'klaw';
import path from 'path';
import { DBStore } from '../db';
import { ObjectType, Field } from 'type-graphql';

export class LocalStorage implements StorageInterface {
  constructor(private fileSystem: LocalFileSystem) {
  }

  private get fullPrefix() {
    if (this.fileSystem.prefix === '') {
      const prefix = this.fileSystem.path;
      if (prefix.endsWith('/')) {
        return prefix;
      }
      return `${prefix}/`;
    }
    return path.join(this.fileSystem.path, this.fileSystem.prefix);
  }
  private fullPath(fileName: string) {
    return path.join(this.fileSystem.path, `${this.fileSystem.prefix}${fileName}`);
  }

  async write(fileName: string, stream: Readable)  {
    const out = this.fullPath(fileName);
    await ensureDir(path.dirname(out));
    const writeStream = createWriteStream(out);
    await new Promise(resolve => writeStream.on('open', resolve));
    stream.pipe(writeStream);
    await new Promise(resolve => {
      stream.on('end', () => {
        writeStream.end(resolve);
      });
    });
  }
  read(fileName: string, stream: Writable) {
    return new Promise<void>(async (resolve, reject) => {
      const inFile = this.fullPath(fileName);
      const readStream = createReadStream(inFile);
      await new Promise(resolve => readStream.on('open', resolve));
      readStream.pipe(stream);
      readStream.on('error', reject);
      readStream.on('end', resolve);
    });
  }
  async del(fileName: string) {
    await unlink(this.fullPath(fileName));
  }
  list(): Promise<StorageBackup[]> {
    return new Promise<StorageBackup[]>((resolve, reject) => {
      const arr: StorageBackup[] = [];
      klaw(this.fileSystem.path).on('data', item => {
        if (!item.stats.isDirectory()) {
          if (item.path.startsWith(this.fullPrefix)) {
            arr.push(new StorageBackup(this, {
              fileName: item.path.substr(this.fullPrefix.length),
            }));
          }
        }
      }).on('error', (err) => {
        reject(err);
      }).on('end', () => {
        resolve(arr);
      })
    });
  }
  async stat(fileName: string): Promise<StorageBackupStat> {
    const info = await stat(this.fullPath(fileName));
    return { size: info.size, modified: info.mtime.getTime() };
  }
  async exists(fileName: string): Promise<boolean> {
    try {
      await access(this.fullPath(fileName), constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }
}

@ObjectType()
export class LocalFileSystem {
  @Field()
  name: string;

  @Field()
  path: string;

  @Field()
  prefix: string;
}

export const localFileSystems = new DBStore<LocalFileSystem>('localFileSystems');
