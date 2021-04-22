import { Field, ObjectType } from 'type-graphql';
import { GraphQLJSON } from '../graphql/scalars/json';

@ObjectType()
export class ContainerPort {
  @Field()
  ip: string;
  @Field()
  privatePort: number;
  @Field()
  publicPort: number;
  @Field()
  type: string;
}

@ObjectType()
export class ContainerHostConfig {
  @Field()
  networkMode: string;
}

@ObjectType()
export class ContainerMount {
  @Field(() => String, { nullable: true })
  name?: string;
  @Field()
  type: string;
  @Field()
  source: string;
  @Field()
  destination: string;
  @Field(() => String, { nullable: true })
  driver?: string;
  @Field()
  mode: string;
  @Field()
  rw: boolean;
  @Field()
  propagation: string;
}

@ObjectType()
export class Container {
  @Field() id: string;
  @Field(_ => [String]) names: string[];
  @Field() image: string;
  @Field() imageID: string;
  @Field() command: string;
  @Field() created: number;
  @Field(() => [ContainerPort]) ports: ContainerPort[];
  @Field(() => GraphQLJSON) labels: { [label: string]: string };
  @Field() state: string;
  @Field() status: string;
  @Field() hostConfig: ContainerHostConfig;
  @Field(_ => [ContainerMount]) mounts: ContainerMount[];
}