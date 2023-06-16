export class StructureDefinition {
  public id?: number;
  public url?: string;
  public code?: string;
  public content?: string;
  public contentType?: 'profile' | 'instance' | 'logical';
  public parent?: string;
  public version?: string;
  public contentFormat?: 'fsh' | 'json';
}
