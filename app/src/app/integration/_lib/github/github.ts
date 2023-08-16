export class GithubStatus {
  public sha: string;
  public files: {[key: string]: 'M' | 'U' | 'D' | 'A' | 'K'};
}
