export class JobLog {
  public id?: number;
  public definition?: JobDefinition;
  public execution?: JobExecution;
  public warnings?: {[id: string]: any};
  public errors?: {[id: string]: any};
}

class JobDefinition {
  public type!: string;
  public source!: string;
}

class JobExecution {
  public started?: Date;
  public finished?: Date;
  public status?: string;
}