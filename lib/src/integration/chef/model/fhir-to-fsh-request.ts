export class FhirToFshRequest {
 public fhir?: any[];
 public dependencies?: string[];
 public logLevel?: 'silly' | 'debug' | 'verbose' | 'http' | 'info' | 'warn' | 'error' | 'silent';
 public style?: 'string' | 'map';
}
