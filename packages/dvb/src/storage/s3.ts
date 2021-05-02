import { ObjectType, Field } from 'type-graphql';
import { Readable, Writable } from 'stream';
import { StorageInterface, StorageBackup, StorageBackupStat } from '.';
import { S3 } from 'aws-sdk';
import { DBStore } from '../db';

export class S3Storage implements StorageInterface {
  constructor(private bucket: S3Bucket) {
  }
  private s3() {
    return new S3({
      region: this.bucket.region,
      accessKeyId: this.bucket.accessKey,
      secretAccessKey: this.bucket.secretKey,
    });
  }
  async write(fileName: string, stream: Readable) {
    const s3 = this.s3();
    await s3.upload({
      Body: stream,
      Bucket: this.bucket.bucket,
      Key: `${this.bucket.prefix}${fileName}`,
    }).promise();
  }
  read(fileName: string, stream: Writable) {
    return new Promise<void>((resolve, reject) => {
      const s3 = this.s3();
      const readStream = s3.getObject({
        Bucket: this.bucket.bucket,
        Key: `${this.bucket.prefix}${fileName}`,
      }).createReadStream()
      readStream.pipe(stream);
      readStream.on('end', resolve);
      readStream.on('error', reject);
    });
  }
  async del(fileName: string) {
    const s3 = this.s3();
    await s3.deleteObject({
      Bucket: this.bucket.bucket,
      Key: `${this.bucket.prefix}${fileName}`,
    }).promise();
  }
  async list(): Promise<StorageBackup[]> {
    const s3 = this.s3();
    const arr: StorageBackup[] = [];
    let token: string | undefined;
    while (true) {
      let objects = await s3.listObjectsV2({
        Bucket: this.bucket.bucket,
        MaxKeys: 1000,
        ContinuationToken: token,
        Prefix: this.bucket.prefix
      }).promise();
      for (let content of objects.Contents || []) {
        const fileName = content.Key?.substr(this.bucket.prefix.length);
        if (fileName) {
          arr.push(new StorageBackup(this, {
            fileName,
          }));
        }
      }
      if (!objects.ContinuationToken) {
        break;
      }
    }
    return arr;
  }
  async stat(fileName: string): Promise<StorageBackupStat> {
    const s3 = this.s3();
    const info = await s3.headObject({
      Bucket: this.bucket.bucket,
      Key: `${this.bucket.prefix}${fileName}`,
    }).promise();
    return { size: info.ContentLength ?? 0, modified: info.LastModified?.getTime() ?? 0 };
  }
  async exists(fileName: string): Promise<boolean> {
    const s3 = this.s3();
    try {
      await s3.headObject({
        Bucket: this.bucket.bucket,
        Key: `${this.bucket.prefix}${fileName}`,
      }).promise();
      return true;
    } catch (err) {
      if (err.code === 'NotFound') {
        return false;
      }
      throw err;
    }
  }
}

@ObjectType()
export class S3Bucket {
  @Field()
  name: string;

  @Field()
  bucket: string;

  @Field()
  region: string;

  @Field()
  prefix: string;

  @Field()
  accessKey: string;

  secretKey: string;
}

export const s3Buckets = new DBStore<S3Bucket>('s3Buckets');