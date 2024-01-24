
export class ChecklistAssertion {
  public id?: number;
  public passed?: boolean;
  public executor?: string;
  public executionDate?: Date;
  public errors?: ChecklistAssertionError[];
}

export class ChecklistAssertionError {
  public error?: string;
  public resources?: {resourceType?: string, resourceId?: string}[];
}
