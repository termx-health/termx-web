export class TransformationDefinition {
  public id?: number;
  public name?: string;
  public mapping?: TransformationDefinitionResource;
  public resources?: TransformationDefinitionResource[];
  public testSource?: string;

  public static isValid(d: TransformationDefinition): boolean {
    return !!d.name && !!d.mapping && TransformationDefinitionResource.isValid(d.mapping)
      && (!d.resources || d.resources.every(r => TransformationDefinitionResource.isValid(r)));
  }
}

export class TransformationDefinitionResource {
  public name?: string;
  public type?: 'mapping' | 'definition' | 'conceptmap';
  public source?: 'local' | 'fhir' | 'static';
  public reference?: {
    localId?: string;

    fhirServer?: string;
    fhirResource?: string;

    content?: string;
  };

  public static isValid(d: TransformationDefinitionResource): boolean {
    return !!d.name && !!d.source &&
      (
        (d.source === 'local' && !!d.reference.localId)
        || (d.source === 'fhir' && !!d.reference.fhirServer && !!d.reference.fhirResource)
        || (d.source === 'static' && !!d.name && !!d.reference.content)
      );
  }
}
