export class ChefMessage {
  public message?: string;
  public location?: {startLine: number, startColumn: number, endLine: number, endColumn: number};
  public input?: string;
}
