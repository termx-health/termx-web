export class FhirSyncParameters {
  public parameter?: FhirSyncParameter[];
}

class FhirSyncParameter {
  public name?: string;
  public valueDecimal?: number;
  public valueString?: string;
}
