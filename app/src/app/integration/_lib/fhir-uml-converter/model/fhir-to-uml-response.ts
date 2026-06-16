export class FhirToUmlResponse {
  public body: Blob;
  public contentType: string;
  public filename?: string;
  public warnings?: string[];
  public errors?: string[];
}
