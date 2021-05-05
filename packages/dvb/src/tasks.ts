import { ObjectType, Field, Float } from 'type-graphql';
import { generate } from 'short-uuid';
import { assign, clone, get } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphQLAny } from './graphql/scalars/any';

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
  constructor(cb: (update: (data: Partial<Omit<Task, 'id' | 'done'>>) => void) => Promise<any> | any) {
    this.id = generate();
    this.status = '';
    this.progress = null;
    this.done = false;
    taskUpdateMap$[this.id] = new BehaviorSubject<Task>(clone(this));
    (async() => {
      try {
        this.complete(await cb(this.update.bind(this)));
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

  @Field(() => GraphQLAny, { nullable: true })
  result: any;

  @Field()
  status: string;

  @Field(() => Float, { nullable: true })
  progress: number | null;

  update(data: Partial<Omit<Task, 'id' | 'done' | 'result' | 'error'>>) {
    if (!this.done) {
      assign(this, data);
      taskUpdateMap$[this.id].next(clone(this));
    }
  }

  complete(result?: any) {
    if (!this.done) {
      this.result = result;
      this.done = true;
      taskUpdateMap$[this.id].next(clone(this));
    }
  }

  throw(err: Error) {
    if (!this.done) {
      console.error(err);
      this.error = get(err, 'message') || get(err, 'code') || 'Unknown error occurred.';
      this.done = true;
      taskUpdateMap$[this.id].next(clone(this));
    }
  }
}