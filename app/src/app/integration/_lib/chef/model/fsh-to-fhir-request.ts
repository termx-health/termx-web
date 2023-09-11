export class FshToFhirRequest {
  public fsh?: string | string[];
  public options?: {
    canonical?: string;
    version?: string;
    fhirVersion?: string;
    dependencies?: any[];
    logLevel?: 'silly' | 'debug' | 'verbose' | 'http' | 'info' | 'warn' | 'error' | 'silent';
  };
}
