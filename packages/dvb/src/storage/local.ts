import { Storage } from '.';
import { createWriteStream } from 'fs-extra';
import { Readable } from 'stream';

export class LocalStorage implements Storage {
  async write(fileName: string, stream: Readable)  {
    const writeStream = createWriteStream(fileName);
    await new Promise(resolve => writeStream.on('open', resolve));
    stream.pipe(writeStream);
    await new Promise(resolve => {
      stream.on('end', () => {
        writeStream.end(resolve);
      });
    });
  }
}