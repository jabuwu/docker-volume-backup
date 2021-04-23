import { ObjectType, Field } from 'type-graphql';
import { Readable, Writable } from 'stream';
import { StorageInterface, StorageBackup } from '.';
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
      Bucket: this.bucket.name,
      Key: `${this.bucket.prefix}${fileName}`,
    }).promise();
  }
  read(fileName: string, stream: Writable) {
    return new Promise<void>((resolve, reject) => {
      const s3 = this.s3();
      const readStream = s3.getObject({
        Bucket: this.bucket.name,
        Key: `${this.bucket.prefix}${fileName}`,
      }).createReadStream()
      readStream.pipe(stream);
      readStream.on('end', resolve);
      readStream.on('error', reject);
    });
  }
  async list(): Promise<StorageBackup[]> {
    const s3 = this.s3();
    const arr: StorageBackup[] = [];
    let token: string | undefined;
    while (true) {
      let objects = await s3.listObjectsV2({
        Bucket: this.bucket.name,
        MaxKeys: 1000,
        ContinuationToken: token,
        Prefix: this.bucket.prefix
      }).promise();
      for (let content of objects.Contents || []) {
        const fileName = content.Key?.substr(this.bucket.prefix.length);
        if (fileName) {
          arr.push({ fileName });
        }
      }
      if (!objects.ContinuationToken) {
        break;
      }
    }
    return arr;
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