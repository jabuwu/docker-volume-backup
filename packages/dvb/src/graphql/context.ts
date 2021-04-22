import { Docker } from '../docker';

export class Context {
  public docker: Docker;
}

export const context = new Context();
context.docker = new Docker();