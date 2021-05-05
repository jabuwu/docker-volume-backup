import { useCallback, useEffect, useState } from 'react';

function is<Type>(o: any, check: (o) => boolean): o is Type {
  return check(o);
}

export function useObjectArray<T>(initialState: T[] = [], onChange?: (array: T[]) => void) {
  const [ value, setValue ] = useState(initialState);
  const [ changed, setChanged ] = useState(false);

  useEffect(() => {
    if (changed) {
      onChange(value);
      setChanged(false);
    }
  }, [ changed ]);

  const add = useCallback((value: T, { silent = false }: { silent?: boolean } = {}) => {
    setValue(array => {
      const result = [ ...array, value ];
      if (!silent) {
        setChanged(true);
      }
      return result;
    });
  }, []);

  const remove = useCallback((i: number, { silent = false }: { silent?: boolean } = {}) => {
    setValue(array => {
      const result = array.filter((_, j) => j !== i);
      if (!silent) {
        setChanged(true);
      }
      return result;
    });
  }, []);

  const update = useCallback<(<Path extends keyof T>(...args: [i: number, path: Path, value: T[Path] | ((value: T[Path]) => T[Path]), options?: { silent?: boolean }]) => void)>((...args) => {
    const [ i, path, value, { silent = false } = {} ] = args;
    if (is<(value: any) => any>(value, o => typeof o === 'function')) {
      setValue(array => {
        const result = array.map((item, j) => i === j ? ({ ...item, [ path ]: value(item[path]) }) : item)
        if (!silent) {
          setChanged(true);
        }
        return result;
      });
    } else {
      setValue(array => {
        const result = array.map((item, j) => i === j ? ({ ...item, [ path ]: value }) : item)
        if (!silent) {
          setChanged(true);
        }
        return result;
      });
    }
  }, []);

  const set = useCallback((value: T[] | ((value: T[]) => T[]), { silent = false }: { silent?: boolean } = {}) => {
    if (is<(value: T[]) => T[]>(value, o => typeof o === 'function')) {
      setValue(array => {
        const result = value(array)
        if (!silent) {
          setChanged(true);
        }
        return result;
      });
    } else {
      setValue(_ => {
        if (!silent) {
          setChanged(true);
        }
        return value;
      });
    }
  }, []);

  return { value, add, remove, update, set };
}