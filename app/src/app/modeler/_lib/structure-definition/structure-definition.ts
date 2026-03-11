export class StructureDefinition {
  public id?: number;
  public url?: string;
  public code?: string;
  public name?: string;
  public parent?: string;
  public publisher?: string;
  public content?: string;
  public contentType?: 'profile' | 'instance' | 'logical';
  public version?: string;
  public fhirId?: string;
  public status?: string;
  public releaseDate?: string;
  public contentFormat?: 'fsh' | 'json';
}
