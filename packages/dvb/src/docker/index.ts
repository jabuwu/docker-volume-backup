import { Container } from './container';
import { Volume } from './volume';
import { camelCaseObj } from '../utility/camel-case-obj';
import { find } from 'lodash';
import { from, interval, Observable } from 'rxjs';
import Dockerode from 'dockerode';
import { concatMap, switchMap, share, map } from 'rxjs/operators';
import { PassThrough, Readable, Writable } from 'stream';

const dockerode = new Dockerode({ socketPath: '/var/run/docker.sock' });

function diffObservable<T extends { [ key: string ]: any[] }>(poll$: Observable<{ before: T, after: T }>, typeName: keyof T, key: keyof T[keyof T][0]) {
  const diff$ = poll$.pipe(
    map(({ before, after }) => {
      const added: T[] = [];
      const removed: T[] = [];
      for (const item of after[typeName]) {
        if (!find(before[typeName], { [ key ]: item[key] })) {
          added.push(item);
        }
      }
      for (const item of before[typeName]) {
        if (!find(after[typeName], { [ key ]: item[key] })) {
          removed.push(item);
        }
      }
      return { added, removed };
    }),
    share()
  );
  const added$: Observable<T[keyof T][0]> = diff$.pipe(
    concatMap(({ added }) => {
      return from(added);
    }),
    share()
  );
  const removed$: Observable<T[keyof T][0]> = diff$.pipe(
    concatMap(({ removed }) => {
      return from(removed);
    }),
    share()
  );
  return { added$, removed$ };
}

export class Docker {
  public volumeAdded$: Observable<Volume>;
  public volumeRemoved$: Observable<Volume>;

  public containerAdded$: Observable<Container>;
  public containerRemoved$: Observable<Container>;

  private _containers: Container[] = [];
  private _volumes: Volume[] = [];

  constructor() {
    const poll$ = interval(1000).pipe(
      switchMap(async () => {
        const before = {
          containers: this._containers,
          volumes: this._volumes,
        };
        this._containers = await this.getContainers();
        this._volumes = await this.getVolumes();
        const after = {
          containers: this._containers,
          volumes: this._volumes,
        };
        return { before, after };
      }),
      share()
    );

    const containerDiff = diffObservable<{ containers: Container[] }>(poll$, 'containers', 'id');
    this.containerAdded$ = containerDiff.added$;
    this.containerRemoved$ = containerDiff.removed$;

    const volumeDiff = diffObservable<{ volumes: Volume[] }>(poll$, 'volumes', 'name');
    this.volumeAdded$ = volumeDiff.added$;
    this.volumeRemoved$ = volumeDiff.removed$;
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
    arr.sort((a, b) => a.name > b.name ? 1 : -1);
    return arr;
  }
}