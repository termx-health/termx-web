export class JobLog {
  public id?: number;
  public definition?: JobDefinition;
  public execution?: JobExecution;
  public warnings?: {[key: string]: any};
  public errors?: {[key: string]: any};
}

class JobDefinition {
  public type?: string;
  public source?: string;
}

class JobExecution {
  public started?: Date;
  public finished?: Date;
  public status?: string;
}