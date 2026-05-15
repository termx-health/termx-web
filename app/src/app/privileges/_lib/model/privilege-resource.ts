export class PrivilegeResource {
  public id?: number;
  public resourceType?: string;
  public resourceId?: string;
  public resourceName?: string;
  public actions?: PrivilegeResourceActions;
}

export class PrivilegeResourceActions {
  public read?: boolean;
  public triage?: boolean;
  public write?: boolean;
  public maintain?: boolean;
}
