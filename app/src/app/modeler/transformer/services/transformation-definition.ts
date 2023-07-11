export class TransformationDefinition {
  public id?: number;
  public name?: string;
  public resources?: TransformationDefinitionResource[];
  public mapping?: TransformationDefinitionResource;
  public testSource?: string;

  public static isValid(d: TransformationDefinition): boolean {
    return !!d.name && !!d.mapping && TransformationDefinitionResource.isValid(d.mapping)
      && (!d.resources || d.resources.every(r => TransformationDefinitionResource.isValid(r)));
  }
}

export class TransformationDefinitionResource {
  public name?: string;
  public type?: string;
  public source?: 'definition' | 'fhir' | 'static';
  public reference?: {
    structureDefinitionId?: number;

    fhirServer?: string;
    fhirResource?: string;

    content?: string;
  };

  public static isValid(d: TransformationDefinitionResource): boolean {
    return !!d.name && !!d.source &&
      (
        (d.source === 'definition' && !!d.reference.structureDefinitionId)
        || (d.source === 'fhir' && !!d.reference.fhirServer && !!d.reference.fhirResource)
        || (d.source === 'static' && !!d.name && !!d.reference.content)
      );
  }
}
