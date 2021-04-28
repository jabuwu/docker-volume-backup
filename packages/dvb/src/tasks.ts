import { ObjectType, Field, Float } from 'type-graphql';
import { generate } from 'short-uuid';
import { assign, clone } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

// TODO: clear out this map somehow?
const taskUpdateMap$: { [ id: string ]: BehaviorSubject<Task> } = {};
export function getSubject(id: string): Observable<Task> {
  if (!taskUpdateMap$[id]) {
    return new Observable<Task>();
  }
  return taskUpdateMap$[id];
}

@ObjectType()
export class Task {
  constructor(cb: (fns: { update: (data: Partial<Omit<Task, 'id' | 'done'>>) => void, complete: () => void, throwError: (err: Error) => void }) => Promise<void> | void) {
    this.id = generate();
    this.status = '';
    this.progress = null;
    this.done = false;
    taskUpdateMap$[this.id] = new BehaviorSubject<Task>(clone(this));
    (async() => {
      try {
        await cb({
          update: this.update.bind(this),
          complete: this.complete.bind(this),
          throwError: this.throw.bind(this),
        });
      } catch (err) {
        this.throw(err);
      }
    })();
  }

  @Field()
  id: string;
  
  @Field()
  done: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field()
  status: string;

  @Field(() => Float, { nullable: true })
  progress: number | null;

  update(data: Partial<Omit<Task, 'id' | 'done'>>) {
    if (!this.done) {
      assign(this, data);
      taskUpdateMap$[this.id].next(clone(this));
    }
  }

  complete() {
    if (!this.done) {
      this.done = true;
      taskUpdateMap$[this.id].next(clone(this));
    }
  }

  throw(err: Error) {
    if (!this.done) {
      this.error = err.message;
      this.done = true;
      taskUpdateMap$[this.id].next(clone(this));
    }
  }
}