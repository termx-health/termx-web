export class CodeSystemContactDetail {
  public name?: string;
  public telecoms?: CodeSystemTelecom[];
}

export class CodeSystemTelecom {
  public system?: string;
  public value?: string;
  public use?: string;
}