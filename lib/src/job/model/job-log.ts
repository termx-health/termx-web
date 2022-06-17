export class JobLog {
  public id?: number;
  public definition?: JobDefinition;
  public execution?: JobExecution;
  public warnings?: string[];
  public successes?: string[];
  public errors?: string[];
}

export class JobLogResponse {
  public jobId? : number;
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