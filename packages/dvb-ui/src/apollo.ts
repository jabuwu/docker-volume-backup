import { withApollo } from 'next-apollo';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import ws from 'ws';

const httpLink = new HttpLink({
  uri: 'http://localhost:1998/graphql',
  credentials: 'same-origin',
});
const wsLink = new WebSocketLink({
  webSocketImpl: typeof window == 'undefined' ? ws : undefined,
  uri: 'ws://localhost:1998/graphql',
  options: {
    reconnect: true,
  }
});
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);
const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});
 
export default withApollo(apolloClient);