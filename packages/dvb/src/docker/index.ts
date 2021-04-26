import { Container } from './container';
import { Volume, pinnedVolumes } from './volume';
import { camelCaseObj } from '../utility/camel-case-obj';
import { Observable, Subject } from 'rxjs';
import Dockerode from 'dockerode';
import { concatMap, map, filter } from 'rxjs/operators';
import { PassThrough, Readable, Writable } from 'stream';
import { findIndex } from 'lodash';

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
        const volume: Volume = camelCaseObj(info)
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

  runInVolume(name: string, command: string[]): Promise<void>;
  runInVolume(name: string, command: string[], direction: 'in', cb: (stdin: Writable) => RunResponse | void): Promise<void>;
  runInVolume(name: string, command: string[], direction: 'out', cb: (pipe: (stdout: Writable, stderr: Writable) => void) => RunResponse | void): Promise<void>;
  runInVolume(name: string, command: string[]): Promise<void> {
    const direction: string = arguments[2];
    const cb: (...args: any[]) => RunResponse | void = arguments[3];
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.pullAlpine();
        const container = await dockerode.createContainer({
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
        let response: Partial<RunResponse> | undefined;
        if (direction) {
          container.attach({ stream: true, ...(direction === 'in' ? { hijack: true, stdin: true } : { stdout: true, stderr: true }) }, function (err, stream) {
            if (err) {
              reject(err);
            } else if (direction === 'in') {
              response = cb(stream) as any;
            } else if (direction === 'out') {
              response = cb((stdout: Writable, stderr: Writable) => {
                container.modem.demuxStream(stream, stdout, stderr);
              }) as any;
            }
          });
        }
        await container.start();
        const result = await container.wait();
        if (result.StatusCode !== 0) {
          throw new Error(`Status code ${result.StatusCode} in volume "${name}" for command "${command.join(' ')}"`);
        }
        if (response) {
          if (response.cleanup) {
            response.cleanup();
          }
          if (response.promise) {
            await response.promise;
          }
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async exportVolume(name: string, exportFn: (stream: Readable) => Promise<any>) {
    await this.runInVolume(name, [ 'tar', '-czf', '-', 'volume' ], 'out', (pipe) => {
      const intermediate = new PassThrough();
      const promise = exportFn(intermediate);
      pipe(intermediate, process.stderr);
      return { promise, cleanup() { intermediate.end() } };
    });
  }

  async importVolume(name: string, importFn: (stream: Writable) => Promise<any>) {
    await this.runInVolume(name, [ 'find', 'volume', '-mindepth', '1', '-delete' ]);
    await this.runInVolume(name, [ 'tar', '-xzf', '-' ], 'in', (stdin) => {
      const intermediate = new PassThrough();
      const promise = importFn(intermediate);
      intermediate.pipe(stdin);
      return { promise, cleanup() { intermediate.end() } };
    });
  }

  async getContainers(): Promise<Container[]> {
    const arr: Container[] = (await dockerode.listContainers()).map(camelCaseObj);
    arr.sort((a, b) => a.id > b.id ? 1 : -1);
    return arr;
  }

  async getVolumes(): Promise<Volume[]> {
    const arr: Volume[] = (await dockerode.listVolumes()).Volumes.map(camelCaseObj);
    arr.forEach(volume => volume.pinned = pinnedVolumes.has(volume.name));
    return arr;
  }
}