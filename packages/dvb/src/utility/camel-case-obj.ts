import { isPlainObject, mapKeys } from 'lodash';
import { iterateObject } from './iterate-object';

export function camelCaseObj(obj: any) {
  return iterateObject(obj, o => {
    if (isPlainObject(o)) {
      return mapKeys(o, (_, key) => {
        let lowercase = true;
        let newKey = '';
        for (let i = 0; i < key.length; ++i) {
          if (key[i].toUpperCase() === key[i] && lowercase) {
            newKey += key[i].toLowerCase();
          } else {
            newKey += key[i];
            lowercase = false;
          }
        }
        return newKey;
      });
    }
    return o;
  });
}