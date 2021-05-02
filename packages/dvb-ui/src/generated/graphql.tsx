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

export type FtpServer = {
  __typename?: 'FtpServer';
  name: Scalars['String'];
  host: Scalars['String'];
  port: Scalars['Int'];
  user: Scalars['String'];
  secure: Scalars['Boolean'];
  prefix: Scalars['String'];
};


export type Mutation = {
  __typename?: 'Mutation';
  exportVolume: Scalars['String'];
  importVolume: Scalars['String'];
  pinVolume: Scalars['Boolean'];
  removeStorage: Scalars['Boolean'];
  deleteBackup: Scalars['Boolean'];
  downloadBackup?: Maybe<Scalars['String']>;
  addSchedule?: Maybe<Schedule>;
  updateSchedule?: Maybe<Schedule>;
  removeSchedule: Scalars['Boolean'];
  addS3Bucket?: Maybe<Storage>;
  updateS3Bucket?: Maybe<Storage>;
  addFtpServer?: Maybe<Storage>;
  updateFtpServer?: Maybe<Storage>;
};


export type MutationExportVolumeArgs = {
  stopContainers?: Maybe<Scalars['Boolean']>;
  fileName?: Maybe<Scalars['String']>;
  storage: Scalars['String'];
  volume: Scalars['String'];
};


export type MutationImportVolumeArgs = {
  stopContainers?: Maybe<Scalars['Boolean']>;
  fileName: Scalars['String'];
  storage: Scalars['String'];
  volume: Scalars['String'];
};


export type MutationPinVolumeArgs = {
  pinned: Scalars['Boolean'];
  volume: Scalars['String'];
};


export type MutationRemoveStorageArgs = {
  name: Scalars['String'];
};


export type MutationDeleteBackupArgs = {
  fileName: Scalars['String'];
  storage: Scalars['String'];
};


export type MutationDownloadBackupArgs = {
  fileName: Scalars['String'];
  storage: Scalars['String'];
};


export type MutationAddScheduleArgs = {
  stopContainers: Scalars['Boolean'];
  hours: Scalars['Int'];
  storage: Scalars['String'];
  volume: Scalars['String'];
};


export type MutationUpdateScheduleArgs = {
  stopContainers?: Maybe<Scalars['Boolean']>;
  hours?: Maybe<Scalars['Int']>;
  storage?: Maybe<Scalars['String']>;
  volume?: Maybe<Scalars['String']>;
  id: Scalars['String'];
};


export type MutationRemoveScheduleArgs = {
  id: Scalars['String'];
};


export type MutationAddS3BucketArgs = {
  prefix?: Maybe<Scalars['String']>;
  secretKey: Scalars['String'];
  accessKey: Scalars['String'];
  region: Scalars['String'];
  bucket: Scalars['String'];
  name: Scalars['String'];
};


export type MutationUpdateS3BucketArgs = {
  prefix?: Maybe<Scalars['String']>;
  secretKey?: Maybe<Scalars['String']>;
  accessKey?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['String']>;
  bucket?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};


export type MutationAddFtpServerArgs = {
  prefix?: Maybe<Scalars['String']>;
  secure: Scalars['Boolean'];
  password: Scalars['String'];
  user: Scalars['String'];
  port: Scalars['Int'];
  host: Scalars['String'];
  name: Scalars['String'];
};


export type MutationUpdateFtpServerArgs = {
  prefix?: Maybe<Scalars['String']>;
  secure?: Maybe<Scalars['Boolean']>;
  password?: Maybe<Scalars['String']>;
  user?: Maybe<Scalars['String']>;
  port?: Maybe<Scalars['Int']>;
  host?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  containers: Array<Container>;
  volumes: Array<Volume>;
  allStorage: Array<Storage>;
  storage?: Maybe<Storage>;
  schedules: Array<Schedule>;
  schedule?: Maybe<Schedule>;
};


export type QueryStorageArgs = {
  name: Scalars['String'];
};


export type QueryScheduleArgs = {
  id: Scalars['String'];
};

export type S3Bucket = {
  __typename?: 'S3Bucket';
  name: Scalars['String'];
  bucket: Scalars['String'];
  region: Scalars['String'];
  prefix: Scalars['String'];
  accessKey: Scalars['String'];
};

export type Schedule = {
  __typename?: 'Schedule';
  id: Scalars['String'];
  volume: Scalars['String'];
  storage: Scalars['String'];
  hours: Scalars['Float'];
  lastUpdate: Scalars['Float'];
  stopContainers: Scalars['Boolean'];
};

export type Storage = {
  __typename?: 'Storage';
  type: Scalars['String'];
  name: Scalars['String'];
  s3Bucket?: Maybe<S3Bucket>;
  ftpServer?: Maybe<FtpServer>;
  backups: Array<StorageBackup>;
};

export type StorageBackup = {
  __typename?: 'StorageBackup';
  fileName: Scalars['String'];
  stat: StorageBackupStat;
};

export type StorageBackupStat = {
  __typename?: 'StorageBackupStat';
  size: Scalars['Float'];
  modified: Scalars['Float'];
};

export type Subscription = {
  __typename?: 'Subscription';
  volumeCreated: Volume;
  volumeDestroyed: Scalars['String'];
  volumeUpdated: Volume;
  taskUpdated: Task;
};


export type SubscriptionTaskUpdatedArgs = {
  id: Scalars['String'];
};

export type Task = {
  __typename?: 'Task';
  id: Scalars['String'];
  done: Scalars['Boolean'];
  error?: Maybe<Scalars['String']>;
  status: Scalars['String'];
  progress?: Maybe<Scalars['Float']>;
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
  pinned: Scalars['Boolean'];
  containers: Array<Container>;
};

export type VolumeUsageData = {
  __typename?: 'VolumeUsageData';
  size: Scalars['Float'];
  refCount: Scalars['Float'];
};

export type ScheduleDataFragment = (
  { __typename?: 'Schedule' }
  & Pick<Schedule, 'id' | 'volume' | 'storage' | 'hours' | 'stopContainers' | 'lastUpdate'>
);

export type StorageDataFragment = (
  { __typename?: 'Storage' }
  & Pick<Storage, 'name' | 'type'>
  & { s3Bucket?: Maybe<(
    { __typename?: 'S3Bucket' }
    & Pick<S3Bucket, 'name' | 'bucket' | 'prefix'>
  )>, ftpServer?: Maybe<(
    { __typename?: 'FtpServer' }
    & Pick<FtpServer, 'name' | 'host' | 'port' | 'user' | 'secure' | 'prefix'>
  )> }
);

export type VolumeDataFragment = (
  { __typename?: 'Volume' }
  & Pick<Volume, 'name' | 'driver' | 'pinned'>
  & { containers: Array<(
    { __typename?: 'Container' }
    & Pick<Container, 'id' | 'names' | 'state'>
  )> }
);

export type AddFtpServerMutationVariables = Exact<{
  name: Scalars['String'];
  host: Scalars['String'];
  user: Scalars['String'];
  password: Scalars['String'];
  secure: Scalars['Boolean'];
  port: Scalars['Int'];
  prefix?: Maybe<Scalars['String']>;
}>;


export type AddFtpServerMutation = (
  { __typename?: 'Mutation' }
  & { addFtpServer?: Maybe<(
    { __typename?: 'Storage' }
    & StorageDataFragment
  )> }
);

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
    { __typename?: 'Storage' }
    & StorageDataFragment
  )> }
);

export type AddScheduleMutationVariables = Exact<{
  volume: Scalars['String'];
  storage: Scalars['String'];
  hours: Scalars['Int'];
  stopContainers: Scalars['Boolean'];
}>;


export type AddScheduleMutation = (
  { __typename?: 'Mutation' }
  & { addSchedule?: Maybe<(
    { __typename?: 'Schedule' }
    & ScheduleDataFragment
  )> }
);

export type DeleteBackupMutationVariables = Exact<{
  storage: Scalars['String'];
  fileName: Scalars['String'];
}>;


export type DeleteBackupMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteBackup'>
);

export type DownloadBackupMutationVariables = Exact<{
  storage: Scalars['String'];
  fileName: Scalars['String'];
}>;


export type DownloadBackupMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'downloadBackup'>
);

export type ExportVolumeMutationVariables = Exact<{
  volume: Scalars['String'];
  storage: Scalars['String'];
  fileName?: Maybe<Scalars['String']>;
  stopContainers?: Maybe<Scalars['Boolean']>;
}>;


export type ExportVolumeMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'exportVolume'>
);

export type ImportVolumeMutationVariables = Exact<{
  volume: Scalars['String'];
  storage: Scalars['String'];
  fileName: Scalars['String'];
  stopContainers?: Maybe<Scalars['Boolean']>;
}>;


export type ImportVolumeMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'importVolume'>
);

export type PinVolumeMutationVariables = Exact<{
  volume: Scalars['String'];
  pinned: Scalars['Boolean'];
}>;


export type PinVolumeMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'pinVolume'>
);

export type RemoveScheduleMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type RemoveScheduleMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'removeSchedule'>
);

export type RemoveStorageMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type RemoveStorageMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'removeStorage'>
);

export type UpdateFtpServerMutationVariables = Exact<{
  name: Scalars['String'];
  host?: Maybe<Scalars['String']>;
  user?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  secure?: Maybe<Scalars['Boolean']>;
  port?: Maybe<Scalars['Int']>;
  prefix?: Maybe<Scalars['String']>;
}>;


export type UpdateFtpServerMutation = (
  { __typename?: 'Mutation' }
  & { updateFtpServer?: Maybe<(
    { __typename?: 'Storage' }
    & StorageDataFragment
  )> }
);

export type UpdateS3BucketMutationVariables = Exact<{
  name: Scalars['String'];
  bucket?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['String']>;
  accessKey?: Maybe<Scalars['String']>;
  secretKey?: Maybe<Scalars['String']>;
  prefix?: Maybe<Scalars['String']>;
}>;


export type UpdateS3BucketMutation = (
  { __typename?: 'Mutation' }
  & { updateS3Bucket?: Maybe<(
    { __typename?: 'Storage' }
    & StorageDataFragment
  )> }
);

export type UpdateScheduleMutationVariables = Exact<{
  id: Scalars['String'];
  volume?: Maybe<Scalars['String']>;
  storage?: Maybe<Scalars['String']>;
  hours?: Maybe<Scalars['Int']>;
  stopContainers?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateScheduleMutation = (
  { __typename?: 'Mutation' }
  & { updateSchedule?: Maybe<(
    { __typename?: 'Schedule' }
    & ScheduleDataFragment
  )> }
);

export type AllStorageQueryVariables = Exact<{ [key: string]: never; }>;


export type AllStorageQuery = (
  { __typename?: 'Query' }
  & { allStorage: Array<(
    { __typename?: 'Storage' }
    & StorageDataFragment
  )> }
);

export type FtpServerQueryVariables = Exact<{
  name: Scalars['String'];
}>;


export type FtpServerQuery = (
  { __typename?: 'Query' }
  & { storage?: Maybe<(
    { __typename?: 'Storage' }
    & Pick<Storage, 'name' | 'type'>
    & { ftpServer?: Maybe<(
      { __typename?: 'FtpServer' }
      & Pick<FtpServer, 'name' | 'host' | 'port' | 'user' | 'secure' | 'prefix'>
    )> }
  )> }
);

export type S3BucketQueryVariables = Exact<{
  name: Scalars['String'];
}>;


export type S3BucketQuery = (
  { __typename?: 'Query' }
  & { storage?: Maybe<(
    { __typename?: 'Storage' }
    & Pick<Storage, 'name' | 'type'>
    & { s3Bucket?: Maybe<(
      { __typename?: 'S3Bucket' }
      & Pick<S3Bucket, 'name' | 'bucket' | 'region' | 'accessKey' | 'prefix'>
    )> }
  )> }
);

export type ScheduleQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type ScheduleQuery = (
  { __typename?: 'Query' }
  & { schedule?: Maybe<(
    { __typename?: 'Schedule' }
    & ScheduleDataFragment
  )> }
);

export type SchedulesQueryVariables = Exact<{ [key: string]: never; }>;


export type SchedulesQuery = (
  { __typename?: 'Query' }
  & { schedules: Array<(
    { __typename?: 'Schedule' }
    & ScheduleDataFragment
  )> }
);

export type StorageQueryVariables = Exact<{
  name: Scalars['String'];
}>;


export type StorageQuery = (
  { __typename?: 'Query' }
  & { storage?: Maybe<(
    { __typename?: 'Storage' }
    & Pick<Storage, 'name' | 'type'>
    & { s3Bucket?: Maybe<(
      { __typename?: 'S3Bucket' }
      & Pick<S3Bucket, 'name'>
    )>, backups: Array<(
      { __typename?: 'StorageBackup' }
      & Pick<StorageBackup, 'fileName'>
      & { stat: (
        { __typename?: 'StorageBackupStat' }
        & Pick<StorageBackupStat, 'size' | 'modified'>
      ) }
    )> }
  )> }
);

export type StorageBackupsQueryVariables = Exact<{
  name: Scalars['String'];
}>;


export type StorageBackupsQuery = (
  { __typename?: 'Query' }
  & { storage?: Maybe<(
    { __typename?: 'Storage' }
    & Pick<Storage, 'name'>
    & { backups: Array<(
      { __typename?: 'StorageBackup' }
      & Pick<StorageBackup, 'fileName'>
      & { stat: (
        { __typename?: 'StorageBackupStat' }
        & Pick<StorageBackupStat, 'size' | 'modified'>
      ) }
    )> }
  )> }
);

export type StorageListQueryVariables = Exact<{ [key: string]: never; }>;


export type StorageListQuery = (
  { __typename?: 'Query' }
  & { allStorage: Array<(
    { __typename?: 'Storage' }
    & Pick<Storage, 'type' | 'name'>
  )> }
);

export type VolumesQueryVariables = Exact<{ [key: string]: never; }>;


export type VolumesQuery = (
  { __typename?: 'Query' }
  & { volumes: Array<(
    { __typename?: 'Volume' }
    & VolumeDataFragment
  )> }
);

export type TaskUpdatedSubscriptionVariables = Exact<{
  id: Scalars['String'];
}>;


export type TaskUpdatedSubscription = (
  { __typename?: 'Subscription' }
  & { taskUpdated: (
    { __typename?: 'Task' }
    & Pick<Task, 'id' | 'status' | 'done' | 'progress' | 'error'>
  ) }
);

export type VolumeCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type VolumeCreatedSubscription = (
  { __typename?: 'Subscription' }
  & { volumeCreated: (
    { __typename?: 'Volume' }
    & VolumeDataFragment
  ) }
);

export type VolumeDestroyedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type VolumeDestroyedSubscription = (
  { __typename?: 'Subscription' }
  & Pick<Subscription, 'volumeDestroyed'>
);

export type VolumeUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type VolumeUpdatedSubscription = (
  { __typename?: 'Subscription' }
  & { volumeUpdated: (
    { __typename?: 'Volume' }
    & VolumeDataFragment
  ) }
);

export const ScheduleDataFragmentDoc = gql`
    fragment scheduleData on Schedule {
  id
  volume
  storage
  hours
  stopContainers
  lastUpdate
}
    `;
export const StorageDataFragmentDoc = gql`
    fragment storageData on Storage {
  name
  type
  s3Bucket {
    name
    bucket
    prefix
  }
  ftpServer {
    name
    host
    port
    user
    secure
    prefix
  }
}
    `;
export const VolumeDataFragmentDoc = gql`
    fragment volumeData on Volume {
  name
  driver
  pinned
  containers {
    id
    names
    state
  }
}
    `;
export const AddFtpServerDocument = gql`
    mutation AddFtpServer($name: String!, $host: String!, $user: String!, $password: String!, $secure: Boolean!, $port: Int!, $prefix: String) {
  addFtpServer(
    name: $name
    host: $host
    user: $user
    password: $password
    secure: $secure
    port: $port
    prefix: $prefix
  ) {
    ...storageData
  }
}
    ${StorageDataFragmentDoc}`;
export type AddFtpServerMutationFn = Apollo.MutationFunction<AddFtpServerMutation, AddFtpServerMutationVariables>;

/**
 * __useAddFtpServerMutation__
 *
 * To run a mutation, you first call `useAddFtpServerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddFtpServerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addFtpServerMutation, { data, loading, error }] = useAddFtpServerMutation({
 *   variables: {
 *      name: // value for 'name'
 *      host: // value for 'host'
 *      user: // value for 'user'
 *      password: // value for 'password'
 *      secure: // value for 'secure'
 *      port: // value for 'port'
 *      prefix: // value for 'prefix'
 *   },
 * });
 */
export function useAddFtpServerMutation(baseOptions?: Apollo.MutationHookOptions<AddFtpServerMutation, AddFtpServerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddFtpServerMutation, AddFtpServerMutationVariables>(AddFtpServerDocument, options);
      }
export type AddFtpServerMutationHookResult = ReturnType<typeof useAddFtpServerMutation>;
export type AddFtpServerMutationResult = Apollo.MutationResult<AddFtpServerMutation>;
export type AddFtpServerMutationOptions = Apollo.BaseMutationOptions<AddFtpServerMutation, AddFtpServerMutationVariables>;
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
    ...storageData
  }
}
    ${StorageDataFragmentDoc}`;
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
export const AddScheduleDocument = gql`
    mutation AddSchedule($volume: String!, $storage: String!, $hours: Int!, $stopContainers: Boolean!) {
  addSchedule(
    volume: $volume
    storage: $storage
    hours: $hours
    stopContainers: $stopContainers
  ) {
    ...scheduleData
  }
}
    ${ScheduleDataFragmentDoc}`;
export type AddScheduleMutationFn = Apollo.MutationFunction<AddScheduleMutation, AddScheduleMutationVariables>;

/**
 * __useAddScheduleMutation__
 *
 * To run a mutation, you first call `useAddScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addScheduleMutation, { data, loading, error }] = useAddScheduleMutation({
 *   variables: {
 *      volume: // value for 'volume'
 *      storage: // value for 'storage'
 *      hours: // value for 'hours'
 *      stopContainers: // value for 'stopContainers'
 *   },
 * });
 */
export function useAddScheduleMutation(baseOptions?: Apollo.MutationHookOptions<AddScheduleMutation, AddScheduleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddScheduleMutation, AddScheduleMutationVariables>(AddScheduleDocument, options);
      }
export type AddScheduleMutationHookResult = ReturnType<typeof useAddScheduleMutation>;
export type AddScheduleMutationResult = Apollo.MutationResult<AddScheduleMutation>;
export type AddScheduleMutationOptions = Apollo.BaseMutationOptions<AddScheduleMutation, AddScheduleMutationVariables>;
export const DeleteBackupDocument = gql`
    mutation DeleteBackup($storage: String!, $fileName: String!) {
  deleteBackup(storage: $storage, fileName: $fileName)
}
    `;
export type DeleteBackupMutationFn = Apollo.MutationFunction<DeleteBackupMutation, DeleteBackupMutationVariables>;

/**
 * __useDeleteBackupMutation__
 *
 * To run a mutation, you first call `useDeleteBackupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteBackupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteBackupMutation, { data, loading, error }] = useDeleteBackupMutation({
 *   variables: {
 *      storage: // value for 'storage'
 *      fileName: // value for 'fileName'
 *   },
 * });
 */
export function useDeleteBackupMutation(baseOptions?: Apollo.MutationHookOptions<DeleteBackupMutation, DeleteBackupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteBackupMutation, DeleteBackupMutationVariables>(DeleteBackupDocument, options);
      }
export type DeleteBackupMutationHookResult = ReturnType<typeof useDeleteBackupMutation>;
export type DeleteBackupMutationResult = Apollo.MutationResult<DeleteBackupMutation>;
export type DeleteBackupMutationOptions = Apollo.BaseMutationOptions<DeleteBackupMutation, DeleteBackupMutationVariables>;
export const DownloadBackupDocument = gql`
    mutation DownloadBackup($storage: String!, $fileName: String!) {
  downloadBackup(storage: $storage, fileName: $fileName)
}
    `;
export type DownloadBackupMutationFn = Apollo.MutationFunction<DownloadBackupMutation, DownloadBackupMutationVariables>;

/**
 * __useDownloadBackupMutation__
 *
 * To run a mutation, you first call `useDownloadBackupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDownloadBackupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [downloadBackupMutation, { data, loading, error }] = useDownloadBackupMutation({
 *   variables: {
 *      storage: // value for 'storage'
 *      fileName: // value for 'fileName'
 *   },
 * });
 */
export function useDownloadBackupMutation(baseOptions?: Apollo.MutationHookOptions<DownloadBackupMutation, DownloadBackupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DownloadBackupMutation, DownloadBackupMutationVariables>(DownloadBackupDocument, options);
      }
export type DownloadBackupMutationHookResult = ReturnType<typeof useDownloadBackupMutation>;
export type DownloadBackupMutationResult = Apollo.MutationResult<DownloadBackupMutation>;
export type DownloadBackupMutationOptions = Apollo.BaseMutationOptions<DownloadBackupMutation, DownloadBackupMutationVariables>;
export const ExportVolumeDocument = gql`
    mutation ExportVolume($volume: String!, $storage: String!, $fileName: String, $stopContainers: Boolean) {
  exportVolume(
    volume: $volume
    storage: $storage
    fileName: $fileName
    stopContainers: $stopContainers
  )
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
 *      stopContainers: // value for 'stopContainers'
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
export const ImportVolumeDocument = gql`
    mutation ImportVolume($volume: String!, $storage: String!, $fileName: String!, $stopContainers: Boolean) {
  importVolume(
    volume: $volume
    storage: $storage
    fileName: $fileName
    stopContainers: $stopContainers
  )
}
    `;
export type ImportVolumeMutationFn = Apollo.MutationFunction<ImportVolumeMutation, ImportVolumeMutationVariables>;

/**
 * __useImportVolumeMutation__
 *
 * To run a mutation, you first call `useImportVolumeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImportVolumeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [importVolumeMutation, { data, loading, error }] = useImportVolumeMutation({
 *   variables: {
 *      volume: // value for 'volume'
 *      storage: // value for 'storage'
 *      fileName: // value for 'fileName'
 *      stopContainers: // value for 'stopContainers'
 *   },
 * });
 */
export function useImportVolumeMutation(baseOptions?: Apollo.MutationHookOptions<ImportVolumeMutation, ImportVolumeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ImportVolumeMutation, ImportVolumeMutationVariables>(ImportVolumeDocument, options);
      }
export type ImportVolumeMutationHookResult = ReturnType<typeof useImportVolumeMutation>;
export type ImportVolumeMutationResult = Apollo.MutationResult<ImportVolumeMutation>;
export type ImportVolumeMutationOptions = Apollo.BaseMutationOptions<ImportVolumeMutation, ImportVolumeMutationVariables>;
export const PinVolumeDocument = gql`
    mutation PinVolume($volume: String!, $pinned: Boolean!) {
  pinVolume(volume: $volume, pinned: $pinned)
}
    `;
export type PinVolumeMutationFn = Apollo.MutationFunction<PinVolumeMutation, PinVolumeMutationVariables>;

/**
 * __usePinVolumeMutation__
 *
 * To run a mutation, you first call `usePinVolumeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePinVolumeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [pinVolumeMutation, { data, loading, error }] = usePinVolumeMutation({
 *   variables: {
 *      volume: // value for 'volume'
 *      pinned: // value for 'pinned'
 *   },
 * });
 */
export function usePinVolumeMutation(baseOptions?: Apollo.MutationHookOptions<PinVolumeMutation, PinVolumeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PinVolumeMutation, PinVolumeMutationVariables>(PinVolumeDocument, options);
      }
export type PinVolumeMutationHookResult = ReturnType<typeof usePinVolumeMutation>;
export type PinVolumeMutationResult = Apollo.MutationResult<PinVolumeMutation>;
export type PinVolumeMutationOptions = Apollo.BaseMutationOptions<PinVolumeMutation, PinVolumeMutationVariables>;
export const RemoveScheduleDocument = gql`
    mutation RemoveSchedule($id: String!) {
  removeSchedule(id: $id)
}
    `;
export type RemoveScheduleMutationFn = Apollo.MutationFunction<RemoveScheduleMutation, RemoveScheduleMutationVariables>;

/**
 * __useRemoveScheduleMutation__
 *
 * To run a mutation, you first call `useRemoveScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeScheduleMutation, { data, loading, error }] = useRemoveScheduleMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemoveScheduleMutation(baseOptions?: Apollo.MutationHookOptions<RemoveScheduleMutation, RemoveScheduleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveScheduleMutation, RemoveScheduleMutationVariables>(RemoveScheduleDocument, options);
      }
export type RemoveScheduleMutationHookResult = ReturnType<typeof useRemoveScheduleMutation>;
export type RemoveScheduleMutationResult = Apollo.MutationResult<RemoveScheduleMutation>;
export type RemoveScheduleMutationOptions = Apollo.BaseMutationOptions<RemoveScheduleMutation, RemoveScheduleMutationVariables>;
export const RemoveStorageDocument = gql`
    mutation RemoveStorage($name: String!) {
  removeStorage(name: $name)
}
    `;
export type RemoveStorageMutationFn = Apollo.MutationFunction<RemoveStorageMutation, RemoveStorageMutationVariables>;

/**
 * __useRemoveStorageMutation__
 *
 * To run a mutation, you first call `useRemoveStorageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveStorageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeStorageMutation, { data, loading, error }] = useRemoveStorageMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useRemoveStorageMutation(baseOptions?: Apollo.MutationHookOptions<RemoveStorageMutation, RemoveStorageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveStorageMutation, RemoveStorageMutationVariables>(RemoveStorageDocument, options);
      }
export type RemoveStorageMutationHookResult = ReturnType<typeof useRemoveStorageMutation>;
export type RemoveStorageMutationResult = Apollo.MutationResult<RemoveStorageMutation>;
export type RemoveStorageMutationOptions = Apollo.BaseMutationOptions<RemoveStorageMutation, RemoveStorageMutationVariables>;
export const UpdateFtpServerDocument = gql`
    mutation UpdateFtpServer($name: String!, $host: String, $user: String, $password: String, $secure: Boolean, $port: Int, $prefix: String) {
  updateFtpServer(
    name: $name
    host: $host
    user: $user
    password: $password
    secure: $secure
    port: $port
    prefix: $prefix
  ) {
    ...storageData
  }
}
    ${StorageDataFragmentDoc}`;
export type UpdateFtpServerMutationFn = Apollo.MutationFunction<UpdateFtpServerMutation, UpdateFtpServerMutationVariables>;

/**
 * __useUpdateFtpServerMutation__
 *
 * To run a mutation, you first call `useUpdateFtpServerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFtpServerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFtpServerMutation, { data, loading, error }] = useUpdateFtpServerMutation({
 *   variables: {
 *      name: // value for 'name'
 *      host: // value for 'host'
 *      user: // value for 'user'
 *      password: // value for 'password'
 *      secure: // value for 'secure'
 *      port: // value for 'port'
 *      prefix: // value for 'prefix'
 *   },
 * });
 */
export function useUpdateFtpServerMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFtpServerMutation, UpdateFtpServerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFtpServerMutation, UpdateFtpServerMutationVariables>(UpdateFtpServerDocument, options);
      }
export type UpdateFtpServerMutationHookResult = ReturnType<typeof useUpdateFtpServerMutation>;
export type UpdateFtpServerMutationResult = Apollo.MutationResult<UpdateFtpServerMutation>;
export type UpdateFtpServerMutationOptions = Apollo.BaseMutationOptions<UpdateFtpServerMutation, UpdateFtpServerMutationVariables>;
export const UpdateS3BucketDocument = gql`
    mutation UpdateS3Bucket($name: String!, $bucket: String, $region: String, $accessKey: String, $secretKey: String, $prefix: String) {
  updateS3Bucket(
    name: $name
    bucket: $bucket
    region: $region
    accessKey: $accessKey
    secretKey: $secretKey
    prefix: $prefix
  ) {
    ...storageData
  }
}
    ${StorageDataFragmentDoc}`;
export type UpdateS3BucketMutationFn = Apollo.MutationFunction<UpdateS3BucketMutation, UpdateS3BucketMutationVariables>;

/**
 * __useUpdateS3BucketMutation__
 *
 * To run a mutation, you first call `useUpdateS3BucketMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateS3BucketMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateS3BucketMutation, { data, loading, error }] = useUpdateS3BucketMutation({
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
export function useUpdateS3BucketMutation(baseOptions?: Apollo.MutationHookOptions<UpdateS3BucketMutation, UpdateS3BucketMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateS3BucketMutation, UpdateS3BucketMutationVariables>(UpdateS3BucketDocument, options);
      }
export type UpdateS3BucketMutationHookResult = ReturnType<typeof useUpdateS3BucketMutation>;
export type UpdateS3BucketMutationResult = Apollo.MutationResult<UpdateS3BucketMutation>;
export type UpdateS3BucketMutationOptions = Apollo.BaseMutationOptions<UpdateS3BucketMutation, UpdateS3BucketMutationVariables>;
export const UpdateScheduleDocument = gql`
    mutation UpdateSchedule($id: String!, $volume: String, $storage: String, $hours: Int, $stopContainers: Boolean) {
  updateSchedule(
    id: $id
    volume: $volume
    storage: $storage
    hours: $hours
    stopContainers: $stopContainers
  ) {
    ...scheduleData
  }
}
    ${ScheduleDataFragmentDoc}`;
export type UpdateScheduleMutationFn = Apollo.MutationFunction<UpdateScheduleMutation, UpdateScheduleMutationVariables>;

/**
 * __useUpdateScheduleMutation__
 *
 * To run a mutation, you first call `useUpdateScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateScheduleMutation, { data, loading, error }] = useUpdateScheduleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      volume: // value for 'volume'
 *      storage: // value for 'storage'
 *      hours: // value for 'hours'
 *      stopContainers: // value for 'stopContainers'
 *   },
 * });
 */
export function useUpdateScheduleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateScheduleMutation, UpdateScheduleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateScheduleMutation, UpdateScheduleMutationVariables>(UpdateScheduleDocument, options);
      }
export type UpdateScheduleMutationHookResult = ReturnType<typeof useUpdateScheduleMutation>;
export type UpdateScheduleMutationResult = Apollo.MutationResult<UpdateScheduleMutation>;
export type UpdateScheduleMutationOptions = Apollo.BaseMutationOptions<UpdateScheduleMutation, UpdateScheduleMutationVariables>;
export const AllStorageDocument = gql`
    query AllStorage {
  allStorage {
    ...storageData
  }
}
    ${StorageDataFragmentDoc}`;

/**
 * __useAllStorageQuery__
 *
 * To run a query within a React component, call `useAllStorageQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllStorageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllStorageQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllStorageQuery(baseOptions?: Apollo.QueryHookOptions<AllStorageQuery, AllStorageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllStorageQuery, AllStorageQueryVariables>(AllStorageDocument, options);
      }
export function useAllStorageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllStorageQuery, AllStorageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllStorageQuery, AllStorageQueryVariables>(AllStorageDocument, options);
        }
export type AllStorageQueryHookResult = ReturnType<typeof useAllStorageQuery>;
export type AllStorageLazyQueryHookResult = ReturnType<typeof useAllStorageLazyQuery>;
export type AllStorageQueryResult = Apollo.QueryResult<AllStorageQuery, AllStorageQueryVariables>;
export const FtpServerDocument = gql`
    query FtpServer($name: String!) {
  storage(name: $name) {
    name
    type
    ftpServer {
      name
      host
      port
      user
      secure
      prefix
    }
  }
}
    `;

/**
 * __useFtpServerQuery__
 *
 * To run a query within a React component, call `useFtpServerQuery` and pass it any options that fit your needs.
 * When your component renders, `useFtpServerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFtpServerQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useFtpServerQuery(baseOptions: Apollo.QueryHookOptions<FtpServerQuery, FtpServerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FtpServerQuery, FtpServerQueryVariables>(FtpServerDocument, options);
      }
export function useFtpServerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FtpServerQuery, FtpServerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FtpServerQuery, FtpServerQueryVariables>(FtpServerDocument, options);
        }
export type FtpServerQueryHookResult = ReturnType<typeof useFtpServerQuery>;
export type FtpServerLazyQueryHookResult = ReturnType<typeof useFtpServerLazyQuery>;
export type FtpServerQueryResult = Apollo.QueryResult<FtpServerQuery, FtpServerQueryVariables>;
export const S3BucketDocument = gql`
    query S3Bucket($name: String!) {
  storage(name: $name) {
    name
    type
    s3Bucket {
      name
      bucket
      region
      accessKey
      prefix
    }
  }
}
    `;

/**
 * __useS3BucketQuery__
 *
 * To run a query within a React component, call `useS3BucketQuery` and pass it any options that fit your needs.
 * When your component renders, `useS3BucketQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useS3BucketQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useS3BucketQuery(baseOptions: Apollo.QueryHookOptions<S3BucketQuery, S3BucketQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<S3BucketQuery, S3BucketQueryVariables>(S3BucketDocument, options);
      }
export function useS3BucketLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<S3BucketQuery, S3BucketQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<S3BucketQuery, S3BucketQueryVariables>(S3BucketDocument, options);
        }
export type S3BucketQueryHookResult = ReturnType<typeof useS3BucketQuery>;
export type S3BucketLazyQueryHookResult = ReturnType<typeof useS3BucketLazyQuery>;
export type S3BucketQueryResult = Apollo.QueryResult<S3BucketQuery, S3BucketQueryVariables>;
export const ScheduleDocument = gql`
    query Schedule($id: String!) {
  schedule(id: $id) {
    ...scheduleData
  }
}
    ${ScheduleDataFragmentDoc}`;

/**
 * __useScheduleQuery__
 *
 * To run a query within a React component, call `useScheduleQuery` and pass it any options that fit your needs.
 * When your component renders, `useScheduleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useScheduleQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useScheduleQuery(baseOptions: Apollo.QueryHookOptions<ScheduleQuery, ScheduleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ScheduleQuery, ScheduleQueryVariables>(ScheduleDocument, options);
      }
export function useScheduleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ScheduleQuery, ScheduleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ScheduleQuery, ScheduleQueryVariables>(ScheduleDocument, options);
        }
export type ScheduleQueryHookResult = ReturnType<typeof useScheduleQuery>;
export type ScheduleLazyQueryHookResult = ReturnType<typeof useScheduleLazyQuery>;
export type ScheduleQueryResult = Apollo.QueryResult<ScheduleQuery, ScheduleQueryVariables>;
export const SchedulesDocument = gql`
    query Schedules {
  schedules {
    ...scheduleData
  }
}
    ${ScheduleDataFragmentDoc}`;

/**
 * __useSchedulesQuery__
 *
 * To run a query within a React component, call `useSchedulesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSchedulesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSchedulesQuery({
 *   variables: {
 *   },
 * });
 */
export function useSchedulesQuery(baseOptions?: Apollo.QueryHookOptions<SchedulesQuery, SchedulesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SchedulesQuery, SchedulesQueryVariables>(SchedulesDocument, options);
      }
export function useSchedulesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SchedulesQuery, SchedulesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SchedulesQuery, SchedulesQueryVariables>(SchedulesDocument, options);
        }
export type SchedulesQueryHookResult = ReturnType<typeof useSchedulesQuery>;
export type SchedulesLazyQueryHookResult = ReturnType<typeof useSchedulesLazyQuery>;
export type SchedulesQueryResult = Apollo.QueryResult<SchedulesQuery, SchedulesQueryVariables>;
export const StorageDocument = gql`
    query Storage($name: String!) {
  storage(name: $name) {
    name
    type
    s3Bucket {
      name
    }
    backups {
      fileName
      stat {
        size
        modified
      }
    }
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
 *      name: // value for 'name'
 *   },
 * });
 */
export function useStorageQuery(baseOptions: Apollo.QueryHookOptions<StorageQuery, StorageQueryVariables>) {
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
export const StorageBackupsDocument = gql`
    query StorageBackups($name: String!) {
  storage(name: $name) {
    name
    backups {
      fileName
      stat {
        size
        modified
      }
    }
  }
}
    `;

/**
 * __useStorageBackupsQuery__
 *
 * To run a query within a React component, call `useStorageBackupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useStorageBackupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStorageBackupsQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useStorageBackupsQuery(baseOptions: Apollo.QueryHookOptions<StorageBackupsQuery, StorageBackupsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StorageBackupsQuery, StorageBackupsQueryVariables>(StorageBackupsDocument, options);
      }
export function useStorageBackupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StorageBackupsQuery, StorageBackupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StorageBackupsQuery, StorageBackupsQueryVariables>(StorageBackupsDocument, options);
        }
export type StorageBackupsQueryHookResult = ReturnType<typeof useStorageBackupsQuery>;
export type StorageBackupsLazyQueryHookResult = ReturnType<typeof useStorageBackupsLazyQuery>;
export type StorageBackupsQueryResult = Apollo.QueryResult<StorageBackupsQuery, StorageBackupsQueryVariables>;
export const StorageListDocument = gql`
    query StorageList {
  allStorage {
    type
    name
  }
}
    `;

/**
 * __useStorageListQuery__
 *
 * To run a query within a React component, call `useStorageListQuery` and pass it any options that fit your needs.
 * When your component renders, `useStorageListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStorageListQuery({
 *   variables: {
 *   },
 * });
 */
export function useStorageListQuery(baseOptions?: Apollo.QueryHookOptions<StorageListQuery, StorageListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StorageListQuery, StorageListQueryVariables>(StorageListDocument, options);
      }
export function useStorageListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StorageListQuery, StorageListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StorageListQuery, StorageListQueryVariables>(StorageListDocument, options);
        }
export type StorageListQueryHookResult = ReturnType<typeof useStorageListQuery>;
export type StorageListLazyQueryHookResult = ReturnType<typeof useStorageListLazyQuery>;
export type StorageListQueryResult = Apollo.QueryResult<StorageListQuery, StorageListQueryVariables>;
export const VolumesDocument = gql`
    query Volumes {
  volumes {
    ...volumeData
  }
}
    ${VolumeDataFragmentDoc}`;

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
export const TaskUpdatedDocument = gql`
    subscription TaskUpdated($id: String!) {
  taskUpdated(id: $id) {
    id
    status
    done
    progress
    error
  }
}
    `;

/**
 * __useTaskUpdatedSubscription__
 *
 * To run a query within a React component, call `useTaskUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useTaskUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTaskUpdatedSubscription({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useTaskUpdatedSubscription(baseOptions: Apollo.SubscriptionHookOptions<TaskUpdatedSubscription, TaskUpdatedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<TaskUpdatedSubscription, TaskUpdatedSubscriptionVariables>(TaskUpdatedDocument, options);
      }
export type TaskUpdatedSubscriptionHookResult = ReturnType<typeof useTaskUpdatedSubscription>;
export type TaskUpdatedSubscriptionResult = Apollo.SubscriptionResult<TaskUpdatedSubscription>;
export const VolumeCreatedDocument = gql`
    subscription VolumeCreated {
  volumeCreated {
    ...volumeData
  }
}
    ${VolumeDataFragmentDoc}`;

/**
 * __useVolumeCreatedSubscription__
 *
 * To run a query within a React component, call `useVolumeCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useVolumeCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVolumeCreatedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useVolumeCreatedSubscription(baseOptions?: Apollo.SubscriptionHookOptions<VolumeCreatedSubscription, VolumeCreatedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<VolumeCreatedSubscription, VolumeCreatedSubscriptionVariables>(VolumeCreatedDocument, options);
      }
export type VolumeCreatedSubscriptionHookResult = ReturnType<typeof useVolumeCreatedSubscription>;
export type VolumeCreatedSubscriptionResult = Apollo.SubscriptionResult<VolumeCreatedSubscription>;
export const VolumeDestroyedDocument = gql`
    subscription VolumeDestroyed {
  volumeDestroyed
}
    `;

/**
 * __useVolumeDestroyedSubscription__
 *
 * To run a query within a React component, call `useVolumeDestroyedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useVolumeDestroyedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVolumeDestroyedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useVolumeDestroyedSubscription(baseOptions?: Apollo.SubscriptionHookOptions<VolumeDestroyedSubscription, VolumeDestroyedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<VolumeDestroyedSubscription, VolumeDestroyedSubscriptionVariables>(VolumeDestroyedDocument, options);
      }
export type VolumeDestroyedSubscriptionHookResult = ReturnType<typeof useVolumeDestroyedSubscription>;
export type VolumeDestroyedSubscriptionResult = Apollo.SubscriptionResult<VolumeDestroyedSubscription>;
export const VolumeUpdatedDocument = gql`
    subscription VolumeUpdated {
  volumeUpdated {
    ...volumeData
  }
}
    ${VolumeDataFragmentDoc}`;

/**
 * __useVolumeUpdatedSubscription__
 *
 * To run a query within a React component, call `useVolumeUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useVolumeUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVolumeUpdatedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useVolumeUpdatedSubscription(baseOptions?: Apollo.SubscriptionHookOptions<VolumeUpdatedSubscription, VolumeUpdatedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<VolumeUpdatedSubscription, VolumeUpdatedSubscriptionVariables>(VolumeUpdatedDocument, options);
      }
export type VolumeUpdatedSubscriptionHookResult = ReturnType<typeof useVolumeUpdatedSubscription>;
export type VolumeUpdatedSubscriptionResult = Apollo.SubscriptionResult<VolumeUpdatedSubscription>;