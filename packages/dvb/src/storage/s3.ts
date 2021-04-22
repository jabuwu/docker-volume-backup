import { ObjectType, Field } from 'type-graphql';
import { Readable } from 'stream';
import { StorageInterface } from '.';
import { S3 } from 'aws-sdk';
import { DBStore } from '../db';


export class S3Storage implements StorageInterface {
  constructor(private bucket: S3Bucket) {
  }
  async write(fileName: string, stream: Readable) {
    const s3 = new S3({
      region: this.bucket.region,
      accessKeyId: this.bucket.accessKey,
      secretAccessKey: this.bucket.secretKey,
    });
    await s3.upload({
      Body: stream,
      Bucket: this.bucket.name,
      Key: fileName,
    }).promise();
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