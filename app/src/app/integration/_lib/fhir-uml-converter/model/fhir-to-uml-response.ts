export class FhirToUmlResponse {
    public body: Blob | MediaSource;
    public contentType: string;
    public filename?: string;
    public warnings?: string[];
    public errors?: string[];
}