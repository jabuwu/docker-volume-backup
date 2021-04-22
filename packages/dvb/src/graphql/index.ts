import { ApolloServer } from 'apollo-server-express';
import { schema } from './schema';
import { Context, context } from './context';
export const apollo = new ApolloServer({
  schema,
  introspection: true,
  playground: {
    settings: {
      ['request.credentials']: 'same-origin',
    },
  },
  context: (): Context => context,
});