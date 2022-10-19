export class StructureDefinition {
  public id?: number;
  public url?: string;
  public code?: string;
  public content?: string;
  public contentType?: 'profile' | 'instance';
  public contentFormat?: 'fsh' | 'json';
}
