import { Container } from './container';
import { Volume, pinnedVolumes } from './volume';
import { camelCaseObj } from '../utility/camel-case-obj';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import Dockerode from 'dockerode';
import { concatMap, map, filter } from 'rxjs/operators';
import { PassThrough, Readable, Writable } from 'stream';
import { find, findIndex } from 'lodash';
import { createGzip } from 'zlib';
import { generate } from 'short-uuid';

const dockerode = new Dockerode({ socketPath: '/var/run/docker.sock' });

type DockerEvent = {
  Type: string;
  Action: string;
  Actor: { ID: string };
};

// TODO: can the events stream die if disconnected from docker?
const event$ = new Subject<DockerEvent>();
dockerode.getEvents().then(stream => {
  let overflow = '';
  stream.on('data', (data) => {
    const events = (overflow + data).toString().split('\n');
    for (let i = 0; i < events.length - 1; ++i) {
      event$.next(JSON.parse(events[i]));
      overflow = '';
    }
    overflow += events[events.length - 1];
  });
});

class RunResponse {
  promise?: Promise<void>;
  cleanup?: () => void;
}

export class Docker {
  private _volumes: Volume[] = [];

  public volumeCreate$: Observable<Volume>;
  public volumeDestroy$: Observable<string>;

  constructor() {
    this.getVolumes().then((volumes) => {
      this._volumes = volumes;
    }).catch((err) => {
      console.error(err);
    });
    this.volumeCreate$ = event$.pipe(
      filter((event: DockerEvent) => event.Type === 'volume' && event.Action === 'create'),
      map(event => dockerode.getVolume(event.Actor.ID)),
      concatMap(volume => volume.inspect()),
      map(info => {
        const volume: Volume = new Volume(this, camelCaseObj(info));
        volume.pinned = pinnedVolumes.has(volume.name);
        return volume;
      }),
      filter((volume) => {
        const index = findIndex(this._volumes, { name: volume.name });
        if (index === -1) {
          this._volumes.push(volume);
          return true;
        }
        return false;
      })
    );
    this.volumeDestroy$ = event$.pipe(
      filter((event: DockerEvent) => event.Type === 'volume' && event.Action === 'destroy'),
      map(event => event.Actor.ID),
      filter((name) => {
        const index = findIndex(this._volumes, { name });
        if (index !== -1) {
          this._volumes.splice(index, 1);
          return true;
        }
        return false;
      })
    );
  }

  async pullAlpine() {
    await dockerode.pull('alpine');
  }

  runInVolume(name: string, command: string[]): Promise<string>;
  runInVolume(name: string, command: string[], direction: 'in', cb: (stdin: Writable) => RunResponse | void): Promise<void>;
  runInVolume(name: string, command: string[], direction: 'out', cb: (pipe: (stdout: Writable, stderr: Writable) => void) => RunResponse | void): Promise<void>;
  runInVolume(name: string, command: string[]): Promise<string | void> {
    const direction: string = arguments[2];
    const cb: (...args: any[]) => RunResponse | void = arguments[3];
    return new Promise<string | void>(async (resolve, reject) => {
      try {
        await this.pullAlpine();
        const container = await dockerode.createContainer({
          name: `docker-volume-backup-${generate().substr(0, 8)}`,
          Image: 'alpine',
          Tty: false,
          Cmd: command,
          OpenStdin: direction === 'in',
          StdinOnce: direction === 'in',
          HostConfig: {
            AutoRemove: true,
            Binds: [ `${name}:/volume` ]
          }
        });
        let responseCleanupCb: Partial<RunResponse>['cleanup'];
        let out: string | void = void(0);
        const responseComplete = new BehaviorSubject(false);
        function handleResponse(response: RunResponse) {
          if (response.promise) {
            response.promise.then(() => {
              responseComplete.next(true);
            }).catch((err) => {
              reject(err);
              responseComplete.next(true);
            });
          } else {
            responseComplete.next(true);
          }
          responseCleanupCb = response.cleanup;
        }
        if (direction) {
          container.attach({ stream: true, ...(direction === 'in' ? { hijack: true, stdin: true } : { stdout: true, stderr: true }) }, function (err, stream) {
            if (err) {
              reject(err);
            } else if (direction === 'in') {
              handleResponse(cb(stream) as any);
            } else if (direction === 'out') {
              handleResponse(cb((stdout: Writable, stderr: Writable) => {
                container.modem.demuxStream(stream, stdout, stderr);
              }) as any);
            }
          });
        } else {
          container.attach({ stream: true, stdout: true, stderr: true }, function (err, stream) {
            if (err) {
              reject(err);
            } else {
              out = '';
              const intermediate = new PassThrough();
              container.modem.demuxStream(stream, intermediate, process.stderr);
              intermediate.on('data', (data: Buffer) => {
                out += data.toString();
              });
              responseComplete.next(true);
            }
          });
        }
        await container.start();
        const result = await container.wait();
        if (result.StatusCode !== 0) {
          throw new Error(`Status code ${result.StatusCode} in volume "${name}" for command "${command.join(' ')}"`);
        }
        if (responseCleanupCb) {
          responseCleanupCb();
        }
        await new Promise<boolean>(resolve => responseComplete.pipe(filter(complete => complete === true)).subscribe(resolve));
        resolve(out);
      } catch (err) {
        reject(err);
      }
    });
  }

  async statVolume(name: string) {
    const approximateSize = Number((await this.runInVolume(name, [ 'du', '-k', 'volume' ])).replace(/\s/g, ' ').split(' ')[0]) * 1024;
    return { approximateSize };
  }

  async exportVolume(name: string, exportFn: (stream: Readable) => Promise<any>, progressCb?: (progress: number) => void) {
    const { approximateSize } = await this.statVolume(name);
    await this.runInVolume(name, [ 'tar', '-cf', '-', 'volume' ], 'out', (pipe) => {
      const sizeStream = new PassThrough();
      const gzip = createGzip();
      const promise = exportFn(gzip);
      pipe(sizeStream, process.stderr);
      let bytes = 0;
      sizeStream.on('data', (data) => {
        bytes += data.length;
        progressCb?.(bytes / approximateSize);
        gzip.write(data);
      });
      return {
        promise,
        cleanup() {
          gzip.end();
          progressCb?.(1);
        }
      };
    });
  }

  async importVolume(name: string, size: number, importFn: (stream: Writable) => Promise<any>, progressCb?: (progress: number) => void) {
    await this.runInVolume(name, [ 'find', 'volume', '-mindepth', '1', '-delete' ]);
    await this.runInVolume(name, [ 'tar', '-xzf', '-' ], 'in', (stdin) => {
      const intermediate = new PassThrough();
      const promise = importFn(intermediate);
      let bytes = 0;
      intermediate.on('data', (data) => {
        bytes += data.length;
        progressCb?.(bytes / size);
        stdin.write(data);
      });
      intermediate.on('end', () => stdin.end());
      return { promise, cleanup() { intermediate.end() } };
    });
  }

  private async eachVolumeContainer(volumeName: string, cb: (container: Container) => Promise<void> | void) {
    const volume = await this.getVolume(volumeName);
    if (!volume) {
      new Error('Volume not found: ' + volumeName);
    }
    const containers = await volume!.containers();
    for (const container of containers) {
      await cb(container);
    }
  }

  async stopVolumeContainers(volume: string): Promise<string[]> {
    const stopped: string[] = [];
    await this.eachVolumeContainer(volume, async (c) => {
      const container = dockerode.getContainer(c.id);
      try {
        await container.stop();
        stopped.push(container.id);
      } catch (err) {
        // 304: container already stopped
        if (err.statusCode !== 304) {
          throw err;
        }
      }
    });
    return stopped;
  }

  async startVolumeContainers(volume: string, filter?: string[]) {
    await this.eachVolumeContainer(volume, async (c) => {
      if (!filter || filter.includes(c.id)) {
        const container = dockerode.getContainer(c.id);
        await container.start();
      }
    });
  }

  async getContainer(id: string): Promise<Container | null> {
    const containers = await this.getContainers();
    return find(containers, { id }) ?? null;
  }

  async getContainers(): Promise<Container[]> {
    const arr: Container[] = (await dockerode.listContainers({ all: true })).map(camelCaseObj);
    arr.sort((a, b) => a.id > b.id ? 1 : -1);
    return arr;
  }

  async getVolume(name: string): Promise<Volume | null> {
    const containers = await this.getVolumes();
    return find(containers, { name }) ?? null;
  }

  async getVolumes(): Promise<Volume[]> {
    const arr: Volume[] = (await dockerode.listVolumes()).Volumes.map(volume => new Volume(this, camelCaseObj(volume)));
    arr.forEach(volume => volume.pinned = pinnedVolumes.has(volume.name));
    return arr;
  }
}