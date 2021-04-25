import { DOWNLOADS_DIR } from './env';
import path from 'path';
import express from 'express';
import { createWriteStream, ensureDir } from 'fs-extra';

// TODO: periodically delete downloaded files

export const middleware = express.static(path.resolve(DOWNLOADS_DIR));

export async function downloadWriteStream(fileName: string) {
  fileName = path.join(Date.now().toString(), fileName);
  const localFileName = path.join(DOWNLOADS_DIR, fileName);
  await ensureDir(path.dirname(localFileName));
  return {
    stream: createWriteStream(localFileName),
    fileName,
    localFileName,
  };
}