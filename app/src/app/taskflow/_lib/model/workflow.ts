export class Workflow {
  public id?: number;
  public taskType?: string;
  public transitions?: WorkflowTransition[];
}

export class WorkflowTransition {
  public from?: string;
  public to?: string;
}
