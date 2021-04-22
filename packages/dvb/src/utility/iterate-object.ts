import { isObject, keys, concat } from 'lodash';

export function iterateObject(o: any, fn: (o: any, path: string[]) => any, path: string[] = []) {
  for (let key of isObject(o) ? keys(o) : []) {
    o[key] = iterateObject(o[key], fn, concat(path, key));
  }
  return fn(o, path);
}