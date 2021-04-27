# Docker Volume Backup

![Logo](https://github.com/jabuwu/docker-volume-backup/blob/master/images/logo.png?raw=true)

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/jabuwu/docker-volume-backup)

Web based docker volume backup utility for backing up volume data to an S3 bucket, FTP, or local filesystem. It works well enough for my needs but I might improve it further, see [#1](https://github.com/jabuwu/docker-volume-backup/issues/1).

## Deployment

The best way to deploy is by using docker compose. Here is a working `docker-compose.yml` file:

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

## Screenshots

![Volumes](https://github.com/jabuwu/docker-volume-backup/blob/master/images/volumes.png?raw=true)

![All Storage](https://github.com/jabuwu/docker-volume-backup/blob/master/images/all-storage.png?raw=true)

![Storage](https://github.com/jabuwu/docker-volume-backup/blob/master/images/storage.png?raw=true)

![Schedules](https://github.com/jabuwu/docker-volume-backup/blob/master/images/schedules.png?raw=true)