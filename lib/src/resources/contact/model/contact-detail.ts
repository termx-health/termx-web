export class ContactDetail {
  public name?: string;
  public telecoms?: Telecom[];
}

export class Telecom {
  public system?: string;
  public value?: string;
  public use?: string;
}
