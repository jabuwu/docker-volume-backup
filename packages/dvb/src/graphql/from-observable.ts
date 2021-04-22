import { PubSub } from 'apollo-server-express';
import { Observable } from 'rxjs';

export function fromObservable<T>(observable: Observable<T>) {
  return function() {
    const pubSub = new PubSub();
    const update = (payload: any) => setTimeout(() => pubSub.publish('progress', payload), 0);
    const iterator = pubSub.asyncIterator([ 'progress' ]);
    const subscription = observable.subscribe(update);
    iterator.return = iterator.return ?? (() => Promise.resolve({ value: undefined, done: true }));
    const savedReturn = iterator.return.bind(iterator);
    iterator.return = () => {
      subscription.unsubscribe();
      return savedReturn();
    };
    return iterator;
  }
}