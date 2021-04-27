import { Docker } from '.';
import { Field, ObjectType } from 'type-graphql';
import { GraphQLJSON } from '../graphql/scalars/json';
import { DBList } from '../db';
import { Container } from './container';
import { assign } from 'lodash';

@ObjectType()
export class VolumeUsageData {
  @Field() size: number;
  @Field() refCount: number;
}

@ObjectType()
export class Volume {
  constructor(private docker: Docker, data: Partial<Volume>) {
    assign(this, data);
  }

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
  @Field(() => [Container])
  async containers(): Promise<Container[]> {
    return (await this.docker.getContainers()).filter(container => {
      for (const mount of container.mounts) {
        if (mount.type === 'volume' && mount.name === this.name) {
          return true;
        }
      }
      return false;
    });
  }
}

export const pinnedVolumes = new DBList<string>('pinnedVolumes');