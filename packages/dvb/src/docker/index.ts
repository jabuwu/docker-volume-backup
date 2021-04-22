import { Container } from './container';
import { Volume } from './volume';
import { camelCaseObj } from '../utility/camel-case-obj';
import { find } from 'lodash';
import { from, interval, Observable } from 'rxjs';
import Dockerode from 'dockerode';
import { concatMap, switchMap, share, map } from 'rxjs/operators';
import { PassThrough, Readable } from 'stream';

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

  exportVolume(name: string, exportFn: (stream: Readable) => Promise<any>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
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

  async getContainers(): Promise<Container[]> {
    return (await dockerode.listContainers()).map(camelCaseObj);
  }

  async getVolumes(): Promise<Volume[]> {
    return (await dockerode.listVolumes()).Volumes.map(camelCaseObj);
  }
}