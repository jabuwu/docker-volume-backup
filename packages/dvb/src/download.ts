import { DOWNLOADS_DIR } from './env';
import path from 'path';
import express from 'express';
import { createWriteStream, ensureDir } from 'fs-extra';
import { PassThrough } from 'stream';

// TODO: periodically delete downloaded files

export const middleware = express.static(path.resolve(DOWNLOADS_DIR));

export async function downloadWriteStream(fileName: string, size: number, progressCb: (progress: number) => void) {
  fileName = path.join(Date.now().toString(), fileName);
  size = Math.max(1, size);
  const localFileName = path.join(DOWNLOADS_DIR, fileName);
  await ensureDir(path.dirname(localFileName));
  const writeStream = createWriteStream(localFileName);
  const stream = new PassThrough();
  let downloadedSize = 0;
  stream.on('data', (data: any) => {
    downloadedSize += data.length;
    progressCb(downloadedSize / size);
    writeStream.write(data);
  });
  stream.on('end', () => {
    writeStream.end();
  });
  return {
    stream,
    fileName,
    localFileName,
  };
}