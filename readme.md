# Docker Volume Backup

![Logo](images/logo.png)

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/jabuwu/docker-volume-backup)

Web based docker volume backup utility for backing up volume data to an S3 bucket or local filesystem. It works well enough for my needs but I might improve it further, see [#1](https://github.com/jabuwu/docker-volume-backup/issues/1).

## Building

Check out the `docker-compose.yml` file for recommended deployment. The `AUTH_USERNAME` and `AUTH_PASSWORD` environment variables are optional. If provided, they will enable nginx basic auth with the given username/password.

## Screenshots

![Volumes](images/volumes.png)

![All Storage](images/all-storage.png)

![Storage](images/storage.png)

![Schedules](images/schedules.png)