import { StorageInterface, StorageBackup, StorageBackupStat } from '.';
import { createReadStream, createWriteStream, unlink } from 'fs-extra';
import { Readable, Writable } from 'stream';
import { ensureDirSync, ensureDir, stat } from 'fs-extra';
import { BACKUPS_DIR } from '../env';
import klaw from 'klaw';
import path from 'path';

const workingDir = path.isAbsolute(BACKUPS_DIR) ? BACKUPS_DIR : path.join(process.cwd(), BACKUPS_DIR);
ensureDirSync(workingDir);

export class LocalStorage implements StorageInterface {
  async write(fileName: string, stream: Readable)  {
    const out = path.join(workingDir, fileName);
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
  async read(fileName: string, stream: Writable) {
    const inFile = path.join(workingDir, fileName);
    const readStream = createReadStream(inFile);
    await new Promise(resolve => readStream.on('open', resolve));
    readStream.pipe(stream);
  }
  async del(fileName: string) {
    await unlink(path.join(workingDir, fileName));
  }
  list(): Promise<StorageBackup[]> {
    return new Promise<StorageBackup[]>((resolve, reject) => {
      const arr: StorageBackup[] = [];
      klaw(workingDir).on('data', item => {
        if (!item.stats.isDirectory()) {
          arr.push(new StorageBackup(this, {
            fileName: item.path.substr(workingDir.length + 1),
          }));
        }
      }).on('error', (err) => {
        reject(err);
      }).on('end', () => {
        resolve(arr);
      })
    });
  }
  async stat(fileName: string): Promise<StorageBackupStat> {
    const info = await stat(path.join(workingDir, fileName));
    return { size: info.size, modified: info.mtime.getTime() };
  }
}