export class PrivilegeResource {
  public id?: number;
  public resourceType?: string;
  public resourceId?: string;
  public actions?: PrivilegeResourceActions;
}

export class PrivilegeResourceActions {
  public view?: boolean;
  public edit?: boolean;
  public publish?: boolean;
}
