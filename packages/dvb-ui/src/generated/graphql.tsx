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

export type AddS3BucketMutationVariables = Exact<{
  name: Scalars['String'];
  bucket: Scalars['String'];
  region: Scalars['String'];
  accessKey: Scalars['String'];
  secretKey: Scalars['String'];
  prefix: Scalars['String'];
}>;


export type AddS3BucketMutation = (
  { __typename?: 'Mutation' }
  & { addS3Bucket?: Maybe<(
    { __typename?: 'S3Bucket' }
    & Pick<S3Bucket, 'name'>
  )> }
);

export type ExportVolumeMutationVariables = Exact<{
  volume: Scalars['String'];
  storage: Scalars['String'];
  fileName?: Maybe<Scalars['String']>;
}>;


export type ExportVolumeMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'exportVolume'>
);

export type RemoveS3BucketMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type RemoveS3BucketMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'removeS3Bucket'>
);

export type StorageQueryVariables = Exact<{ [key: string]: never; }>;


export type StorageQuery = (
  { __typename?: 'Query' }
  & { s3Buckets: Array<(
    { __typename?: 'S3Bucket' }
    & Pick<S3Bucket, 'name' | 'bucket' | 'prefix'>
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


export const AddS3BucketDocument = gql`
    mutation AddS3Bucket($name: String!, $bucket: String!, $region: String!, $accessKey: String!, $secretKey: String!, $prefix: String!) {
  addS3Bucket(
    name: $name
    bucket: $bucket
    region: $region
    accessKey: $accessKey
    secretKey: $secretKey
    prefix: $prefix
  ) {
    name
  }
}
    `;
export type AddS3BucketMutationFn = Apollo.MutationFunction<AddS3BucketMutation, AddS3BucketMutationVariables>;

/**
 * __useAddS3BucketMutation__
 *
 * To run a mutation, you first call `useAddS3BucketMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddS3BucketMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addS3BucketMutation, { data, loading, error }] = useAddS3BucketMutation({
 *   variables: {
 *      name: // value for 'name'
 *      bucket: // value for 'bucket'
 *      region: // value for 'region'
 *      accessKey: // value for 'accessKey'
 *      secretKey: // value for 'secretKey'
 *      prefix: // value for 'prefix'
 *   },
 * });
 */
export function useAddS3BucketMutation(baseOptions?: Apollo.MutationHookOptions<AddS3BucketMutation, AddS3BucketMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddS3BucketMutation, AddS3BucketMutationVariables>(AddS3BucketDocument, options);
      }
export type AddS3BucketMutationHookResult = ReturnType<typeof useAddS3BucketMutation>;
export type AddS3BucketMutationResult = Apollo.MutationResult<AddS3BucketMutation>;
export type AddS3BucketMutationOptions = Apollo.BaseMutationOptions<AddS3BucketMutation, AddS3BucketMutationVariables>;
export const ExportVolumeDocument = gql`
    mutation ExportVolume($volume: String!, $storage: String!, $fileName: String) {
  exportVolume(volume: $volume, storage: $storage, fileName: $fileName)
}
    `;
export type ExportVolumeMutationFn = Apollo.MutationFunction<ExportVolumeMutation, ExportVolumeMutationVariables>;

/**
 * __useExportVolumeMutation__
 *
 * To run a mutation, you first call `useExportVolumeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExportVolumeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [exportVolumeMutation, { data, loading, error }] = useExportVolumeMutation({
 *   variables: {
 *      volume: // value for 'volume'
 *      storage: // value for 'storage'
 *      fileName: // value for 'fileName'
 *   },
 * });
 */
export function useExportVolumeMutation(baseOptions?: Apollo.MutationHookOptions<ExportVolumeMutation, ExportVolumeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ExportVolumeMutation, ExportVolumeMutationVariables>(ExportVolumeDocument, options);
      }
export type ExportVolumeMutationHookResult = ReturnType<typeof useExportVolumeMutation>;
export type ExportVolumeMutationResult = Apollo.MutationResult<ExportVolumeMutation>;
export type ExportVolumeMutationOptions = Apollo.BaseMutationOptions<ExportVolumeMutation, ExportVolumeMutationVariables>;
export const RemoveS3BucketDocument = gql`
    mutation RemoveS3Bucket($name: String!) {
  removeS3Bucket(name: $name)
}
    `;
export type RemoveS3BucketMutationFn = Apollo.MutationFunction<RemoveS3BucketMutation, RemoveS3BucketMutationVariables>;

/**
 * __useRemoveS3BucketMutation__
 *
 * To run a mutation, you first call `useRemoveS3BucketMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveS3BucketMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeS3BucketMutation, { data, loading, error }] = useRemoveS3BucketMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useRemoveS3BucketMutation(baseOptions?: Apollo.MutationHookOptions<RemoveS3BucketMutation, RemoveS3BucketMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveS3BucketMutation, RemoveS3BucketMutationVariables>(RemoveS3BucketDocument, options);
      }
export type RemoveS3BucketMutationHookResult = ReturnType<typeof useRemoveS3BucketMutation>;
export type RemoveS3BucketMutationResult = Apollo.MutationResult<RemoveS3BucketMutation>;
export type RemoveS3BucketMutationOptions = Apollo.BaseMutationOptions<RemoveS3BucketMutation, RemoveS3BucketMutationVariables>;
export const StorageDocument = gql`
    query Storage {
  s3Buckets {
    name
    bucket
    prefix
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