import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A JSON object. */
  JSON: any;
};

export type Container = {
  __typename?: 'Container';
  id: Scalars['String'];
  names: Array<Scalars['String']>;
  image: Scalars['String'];
  imageID: Scalars['String'];
  command: Scalars['String'];
  created: Scalars['Float'];
  ports: Array<ContainerPort>;
  labels: Scalars['JSON'];
  state: Scalars['String'];
  status: Scalars['String'];
  hostConfig: ContainerHostConfig;
  mounts: Array<ContainerMount>;
};

export type ContainerHostConfig = {
  __typename?: 'ContainerHostConfig';
  networkMode: Scalars['String'];
};

export type ContainerMount = {
  __typename?: 'ContainerMount';
  name?: Maybe<Scalars['String']>;
  type: Scalars['String'];
  source: Scalars['String'];
  destination: Scalars['String'];
  driver?: Maybe<Scalars['String']>;
  mode: Scalars['String'];
  rw: Scalars['Boolean'];
  propagation: Scalars['String'];
};

export type ContainerPort = {
  __typename?: 'ContainerPort';
  ip: Scalars['String'];
  privatePort: Scalars['Float'];
  publicPort: Scalars['Float'];
  type: Scalars['String'];
};


export type Mutation = {
  __typename?: 'Mutation';
  exportVolume: Scalars['Boolean'];
  addS3Bucket?: Maybe<S3Bucket>;
  removeS3Bucket: Scalars['Boolean'];
};


export type MutationExportVolumeArgs = {
  fileName?: Maybe<Scalars['String']>;
  storage: Scalars['String'];
  volume: Scalars['String'];
};


export type MutationAddS3BucketArgs = {
  prefix?: Maybe<Scalars['String']>;
  secretKey: Scalars['String'];
  accessKey: Scalars['String'];
  region: Scalars['String'];
  bucket: Scalars['String'];
  name: Scalars['String'];
};


export type MutationRemoveS3BucketArgs = {
  name: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  containers: Array<Container>;
  volumes: Array<Volume>;
  s3Buckets: Array<S3Bucket>;
  s3Bucket?: Maybe<S3Bucket>;
};


export type QueryS3BucketArgs = {
  name: Scalars['String'];
};

export type S3Bucket = {
  __typename?: 'S3Bucket';
  name: Scalars['String'];
  bucket: Scalars['String'];
  region: Scalars['String'];
  prefix: Scalars['String'];
  accessKey: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  containerAdded: Container;
  containerRemoved: Container;
  volumeAdded: Volume;
  volumeRemoved: Volume;
};

export type Volume = {
  __typename?: 'Volume';
  name: Scalars['String'];
  driver: Scalars['String'];
  mountpoint: Scalars['String'];
  status?: Maybe<Scalars['JSON']>;
  labels?: Maybe<Scalars['JSON']>;
  scope: Scalars['String'];
  options?: Maybe<Scalars['JSON']>;
  usageData?: Maybe<VolumeUsageData>;
};

export type VolumeUsageData = {
  __typename?: 'VolumeUsageData';
  size: Scalars['Float'];
  refCount: Scalars['Float'];
};

export type StorageQueryVariables = Exact<{ [key: string]: never; }>;


export type StorageQuery = (
  { __typename?: 'Query' }
  & { s3Buckets: Array<(
    { __typename?: 'S3Bucket' }
    & Pick<S3Bucket, 'name' | 'bucket'>
  )> }
);

export type VolumesQueryVariables = Exact<{ [key: string]: never; }>;


export type VolumesQuery = (
  { __typename?: 'Query' }
  & { volumes: Array<(
    { __typename?: 'Volume' }
    & Pick<Volume, 'name'>
  )> }
);


export const StorageDocument = gql`
    query Storage {
  s3Buckets {
    name
    bucket
  }
}
    `;

/**
 * __useStorageQuery__
 *
 * To run a query within a React component, call `useStorageQuery` and pass it any options that fit your needs.
 * When your component renders, `useStorageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStorageQuery({
 *   variables: {
 *   },
 * });
 */
export function useStorageQuery(baseOptions?: Apollo.QueryHookOptions<StorageQuery, StorageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StorageQuery, StorageQueryVariables>(StorageDocument, options);
      }
export function useStorageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StorageQuery, StorageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StorageQuery, StorageQueryVariables>(StorageDocument, options);
        }
export type StorageQueryHookResult = ReturnType<typeof useStorageQuery>;
export type StorageLazyQueryHookResult = ReturnType<typeof useStorageLazyQuery>;
export type StorageQueryResult = Apollo.QueryResult<StorageQuery, StorageQueryVariables>;
export const VolumesDocument = gql`
    query Volumes {
  volumes {
    name
  }
}
    `;

/**
 * __useVolumesQuery__
 *
 * To run a query within a React component, call `useVolumesQuery` and pass it any options that fit your needs.
 * When your component renders, `useVolumesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVolumesQuery({
 *   variables: {
 *   },
 * });
 */
export function useVolumesQuery(baseOptions?: Apollo.QueryHookOptions<VolumesQuery, VolumesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<VolumesQuery, VolumesQueryVariables>(VolumesDocument, options);
      }
export function useVolumesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<VolumesQuery, VolumesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<VolumesQuery, VolumesQueryVariables>(VolumesDocument, options);
        }
export type VolumesQueryHookResult = ReturnType<typeof useVolumesQuery>;
export type VolumesLazyQueryHookResult = ReturnType<typeof useVolumesLazyQuery>;
export type VolumesQueryResult = Apollo.QueryResult<VolumesQuery, VolumesQueryVariables>;