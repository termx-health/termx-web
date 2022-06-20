export class FhirParameters {
  public parameter?: FhirParameter[];
}

class FhirParameter {
  public name?: string;
  public valueDecimal?: number;
  public valueString?: string;
}
