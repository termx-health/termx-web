export class SpaceDiff {
  public items?: SpaceDiffItem[];
}

export class SpaceDiffItem {
  public resourceId?: string;
  public resourceType?: string;
  public resourceServer?: string;
  public upToDate?: boolean;
}
