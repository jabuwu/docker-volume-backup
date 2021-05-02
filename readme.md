# Docker Volume Backup

![Logo](https://github.com/jabuwu/docker-volume-backup/blob/master/images/logo.png?raw=true)

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/jabuwu/docker-volume-backup)

Web based docker volume backup utility for backing up volume data to an S3 bucket, FTP, or local filesystem.

## Project Status

Use with caution. I've tested the project extensively with relatively small volumes and relatively few backup files, mostly using S3 as storage. Would love to get more people testing the project.

A list of planned features/improvements can be found at [#1](https://github.com/jabuwu/docker-volume-backup/issues/1). Once those features are implemented, I'll probably create some versioning/release system so that Docker Hub need only build "stable" versions of the project.

## How It works

The backend interacts with the Docker API through [dockerode](https://github.com/apocas/dockerode). The backup and restore operations create [alpine](https://hub.docker.com/_/alpine) containers attached to the volumes and runs `tar` commands inside them (along with a few other Unix commands), piping the data to/from `tar` back to the node process, which [gzip](https://nodejs.org/api/zlib.html#zlib_zlib_creategzip_options) compresses the data and streams it to/from S3, FTP, or the local filesystem.

The frontend is written in [Next.js](https://nextjs.org/) and simply interacts with the backend, mostly through [GraphQL](https://graphql.org/) queries. It's my first "large" React project so I'm sure I'm doing a lot of things suboptimally, and the code feels pretty messy.

## Deployment

The best way to deploy is to use docker compose. Here is a working `docker-compose.yml` file:

```
version: '3'
services:
  docker-volume-backup:
    image: jabuwu/docker-volume-backup
    restart: always
    environment:
      - AUTH_USERNAME=user
      - AUTH_PASSWORD=pass
    ports:
      - "1999:1999"
    volumes:
      - data:/data
      - /var/run/docker.sock:/var/run/docker.sock
volumes:
  data:
```

The `AUTH_USERNAME` and `AUTH_PASSWORD` environment variables are optional. If provided, they will enable nginx basic auth with the given username/password.

## Screenshots (Slightly Outdated)

![Volumes](https://github.com/jabuwu/docker-volume-backup/blob/master/images/volumes.png?raw=true)

![All Storage](https://github.com/jabuwu/docker-volume-backup/blob/master/images/all-storage.png?raw=true)

![Storage](https://github.com/jabuwu/docker-volume-backup/blob/master/images/storage.png?raw=true)

![Schedules](https://github.com/jabuwu/docker-volume-backup/blob/master/images/schedules.png?raw=true)