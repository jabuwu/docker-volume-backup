import { Readable } from 'stream';
import { LocalStorage } from './local';
import { s3Buckets, S3Storage } from './s3';

export interface Storage {
  write(fileName: string, stream: Readable): Promise<void>;
}

export function getStorage(name: string): Storage | null {
  if (name === 'local') {
    return new LocalStorage();
  }
  const s3Bucket = s3Buckets.findOne({ alias: name });
  if (s3Bucket) {
    return new S3Storage(s3Bucket);
  }
  return null;
}