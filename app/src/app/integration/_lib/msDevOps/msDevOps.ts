export class MsDevOpsStatus {
  public sha: string;
  public files: {[key: string]: 'M' | 'U' | 'D' | 'A' | 'K'};
}

export class MsDevOpsDiff {
  public left?: string;
  public right?: string;
}
