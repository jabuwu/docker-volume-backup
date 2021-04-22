import { GraphQLScalarType } from 'graphql';

export const GraphQLJSON = new GraphQLScalarType({
  name: 'JSON',
  description: 'A JSON object.',
  serialize(value: unknown): any {
    return value;
  },
});