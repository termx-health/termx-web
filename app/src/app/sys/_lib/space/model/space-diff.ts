export class SpaceDiff {
  public items?: SpaceDiffItem[];
  public error?: string;
}

export class SpaceDiffItem {
  public id?: number;
  public resourceId?: string;
  public resourceType?: string;
  public resourceServer?: string;
  public upToDate?: boolean;
}
