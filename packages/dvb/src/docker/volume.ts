import { Field, ObjectType } from 'type-graphql';
import { GraphQLJSON } from '../graphql/scalars/json';
import { DBList } from '../db';

@ObjectType()
export class VolumeUsageData {
  @Field() size: number;
  @Field() refCount: number;
}

@ObjectType()
export class Volume {
  @Field()
  name: string;
  @Field()
  driver: string;
  @Field()
  mountpoint: string;
  @Field(() => GraphQLJSON, { nullable: true })
  status?: { [key: string]: string };
  @Field(() => GraphQLJSON, { nullable: true })
  labels: { [key: string]: string };
  @Field(() => String)
  scope: 'local' | 'global';
  @Field(() => GraphQLJSON, { nullable: true })
  options: { [key: string]: string } | null;
  @Field(() => VolumeUsageData, { nullable: true })
  usageData?: VolumeUsageData;
  @Field()
  pinned: boolean;
}

export const pinnedVolumes = new DBList<string>('pinnedVolumes');