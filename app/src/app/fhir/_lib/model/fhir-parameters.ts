export class FhirParameters {
  public resourceType?: string;
  public parameter?: FhirParameter[];
}

class FhirParameter {
  public name?: string;
  public valueDecimal?: number;
  public valueString?: string;
  public valueBoolean?: boolean;
  public valueCoding?: {code?: string, system?: string};
  public part?: FhirParameterPart[];
}

class FhirParameterPart {
  public name?: string;
  public valueCode?: string;
  public valueString?: string;
}
