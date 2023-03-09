export class ProjectDiff {
  public items?: ProjectDiffItem[];
}

export class ProjectDiffItem {
  public resourceId?: string;
  public resourceType?: string;
  public resourceServer?: string;
  public upToDate?: boolean;
}
