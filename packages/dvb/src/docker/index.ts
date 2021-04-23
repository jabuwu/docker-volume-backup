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

  exportVolume(name: string, exportFn: (stream: Readable) => Promise<any>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      await this.pullAlpine();
      const container = await dockerode.createContainer({
        Image: 'alpine',
        Tty: false,
        Cmd: [ 'tar', '-czf', '-', 'volume' ],
        HostConfig: {
          AutoRemove: true,
          Binds: [ `${name}:/volume` ]
        }
      });
      const intermediate = new PassThrough();
      let exportPromise: Promise<void> | undefined;
      container.attach({ stream: true, stdout: true, stderr: true }, function (err, stream) {
        if (err) {
          reject(err);
        } else {
          exportPromise = exportFn(intermediate);
          container.modem.demuxStream(stream, intermediate, process.stderr);
        }
      });
      await container.start();
      await container.wait();
      intermediate.end();
      if (exportPromise) {
        await exportPromise;
      }
      resolve();
    });
  }

  importVolume(name: string, importFn: (stream: Writable) => Promise<any>) {
    return new Promise<void>(async (resolve, reject) => {
      await this.pullAlpine();
      await dockerode.run('alpine', [ 'rm', '-rf', '/volume' ], [], {
        HostConfig: {
          AutoRemove: true,
          Binds: [ `${name}:/volume` ]
        }
      });
      let container = await dockerode.createContainer({
        Image: 'alpine',
        Tty: false,
        Cmd: [ 'tar', '-xzf', '-' ],
        OpenStdin: true,
        StdinOnce: true,
        HostConfig: {
          AutoRemove: true,
          Binds: [ `${name}:/volume` ]
        }
      });
      const intermediate = new PassThrough();
      let importPromise: Promise<void> | undefined;
      container.attach({ stream: true, hijack: true, stdin: true, stdout: false, stderr: false }, async function (err, stream) {
        if (err) {
          reject(err);
        } else {
          importPromise = importFn(intermediate);
          intermediate.pipe(stream!);
        }
      });
      await container.start();
      let result = await container.wait();
      if (result.StatusCode !== 0) {
        throw new Error('Status code: ' + result.StatusCode);
      }
      intermediate.end();
      if (importPromise) {
        await importPromise;
      }
      resolve();
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
    arr.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.name > b.name ? 1 : -1;
    });
    return arr;
  }
}