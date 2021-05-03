import { Docker } from '.';
import { Field, ObjectType } from 'type-graphql';
import { GraphQLJSON } from '../graphql/scalars/json';
import { DBList } from '../db';
import { Container, ContainerMount } from './container';
import { assign } from 'lodash';
import { VolumeInspectInfo } from 'dockerode';
import { camelCaseObj } from '../utility/camel-case-obj';
import { directoryToName } from '../utility/directory-to-name';

@ObjectType()
export class VolumeUsageData {
  @Field() size: number;
  @Field() refCount: number;
}

@ObjectType()
export class Volume {
  static createFromVolumeInfo(docker: Docker, data: VolumeInspectInfo) {
    return new Volume(docker, {
      ...camelCaseObj(data),
      type: 'volume',
      safeName: data.Name,
    });
  }
  static createFromBind(docker: Docker, data: ContainerMount) {
    if (data.type !== 'bind') {
      throw new Error(`Tried to instantiate Volume from unsupported type: ${data.type}`);
    }
    return new Volume(docker, {
      ...camelCaseObj(data),
      name: data.source,
      safeName: directoryToName(data.source)
    });
  }

  private constructor(private docker: Docker, data: Partial<Volume>) {
    assign(this, data);
    this.pinned = pinnedVolumes.has(this.name);
  }

  @Field()
  name: string;
  @Field()
  safeName: string;
  @Field(_ => String, { nullable: true })
  driver: string | null;
  @Field()
  type: string;
  @Field(_ => String, { nullable: true })
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
  @Field(_ => String, { nullable: true })
  source: string | null;
  @Field(() => [Container])
  async containers(): Promise<Container[]> {
    return (await this.docker.getContainers()).filter(container => {
      for (const mount of container.mounts) {
        if (this.type === 'volume') {
          if (mount.type === 'volume' && mount.name === this.name) {
            return true;
          }
        } else if (this.type === 'bind') {
          if (mount.type === 'bind' && mount.source === this.name) {
            return true;
          }
        }
      }
      return false;
    });
  }
}

export const pinnedVolumes = new DBList<string>('pinnedVolumes');