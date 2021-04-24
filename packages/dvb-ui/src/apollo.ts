import { withApollo } from 'next-apollo';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { VolumesQuery } from './generated/graphql';

const isServer = typeof window === 'undefined';

let wsUri = process.env.NEXT_PUBLIC_GRAPHQL_WS || 'ws://localhost:1998/graphql';
if (!isServer && !wsUri.startsWith('wss://')  && !wsUri.startsWith('ws://')) {
  wsUri = ((window.location.protocol === 'https:') ? 'wss://' : 'ws://') + window.location.host + wsUri;
}

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL || 'http://localhost:1998/graphql',
  credentials: 'same-origin',
});
const wsLink = !isServer ? new WebSocketLink({
  uri: wsUri,
  options: {
    reconnect: true,
  }
}) : null;
const splitLink = isServer ? httpLink : split(
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
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          volumes(existing: VolumesQuery['volumes'], { canRead, readField }) {
            if (!existing) return existing;
            existing = Object.assign([], existing);
            existing.sort((a, b) => {
              if (readField('pinned', a) && !readField('pinned', b)) return -1;
              if (!readField('pinned', a) && readField('pinned', b)) return 1;
              return readField('name', a) > readField('name', b) ? 1 : -1;
            });
            return existing;
          },
        },
      },
      Volume: {
        keyFields: [ 'name' ],
      },
      Storage: {
        keyFields: [ 'name' ]
      },
      S3Bucket: {
        keyFields: [ 'name' ]
      },
    },
  }),
  connectToDevTools: true,
});