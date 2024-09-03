export class TransformationDefinition {
  public id?: number;
  public name?: string;
  public mapping?: TransformationDefinitionResource;
  public resources?: TransformationDefinitionResource[];
  public testSource?: string;

  public createdAt?: Date;
  public createdBy?: string;
  public modifiedAt?: Date;
  public modifiedBy?: string;

  public static isValid(d: TransformationDefinition): boolean {
    return !!d.name && !!d.mapping && TransformationDefinitionResource.isValid(d.mapping)
      && (!d.resources || d.resources.every(r => TransformationDefinitionResource.isValid(r)));
  }
}

export type TransformationDefinitionResourceType = 'mapping' | 'definition' | 'conceptmap'
export type TransformationDefinitionResourceSource = 'local' | 'url' | 'static'

export class TransformationDefinitionResource {
  public name?: string;
  public type?: TransformationDefinitionResourceType;
  public source?: TransformationDefinitionResourceSource;
  public reference?: {
    localId?: string;
    resourceServerId?: string;
    resourceUrl?: string;
    content?: string;
  };

  public static isValid(d: TransformationDefinitionResource): boolean {
    return !!d.name && !!d.source &&
      (
        (d.source === 'local' && !!d.reference.localId)
        || (d.source === 'url' && !!d.reference.resourceUrl)
        || (d.source === 'static' && !!d.name && !!d.reference.content)
      );
  }
}
