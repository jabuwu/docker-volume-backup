import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { DB_FILE } from './env';
import { ensureDirSync } from 'fs-extra';
import path from 'path';

ensureDirSync(path.dirname(DB_FILE));
const adapter = new FileSync(DB_FILE);
export const db = low(adapter);
db.defaults({
  versions: {},
  s3Buckets: [],
  schedules: []
}).write();

function getVersion(name: string) {
  return db.get(['versions', name]).value() ?? 0;
}

function setVersion(name: string, version: number) {
  return db.set(['versions', name], version).write();
}

export class DBStore<T> {
  private items: T[] = [];

  constructor(private name: string) {
    this.items = db.get(name).value();
  }

  migrate(to: number, cb: (item: any) => void) {
    if (getVersion(this.name) < to) {
      db.set(this.name, this.items.map(item => { cb(item); return item; })).write();
      setVersion(this.name, to);
    }
  }

  all(): T[] {
    return this.items;
  }

  create(item: T): T {
    (<any>db).get(this.name).push(item).write();
    return item;
  }

  findOne(where: Partial<T>): T | null {
    return (<any>db).get(this.name).find(where).value() ?? null;
  }

  update(where: Partial<T>, data: Partial<T>) {
    (<any>db).get(this.name).find(where).assign(data).write();
  }

  del(where: Partial<T>) {
    const found = !!(<any>db).get(this.name).find(where).value();
    (<any>db).get(this.name).remove(where).write();
    return found;
  }
}