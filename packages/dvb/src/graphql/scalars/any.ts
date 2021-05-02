import { GraphQLScalarType } from 'graphql';

export const GraphQLAny = new GraphQLScalarType({
  name: 'Any',
  description: 'Any type.',
  serialize(value: unknown): any {
    return value;
  },
});