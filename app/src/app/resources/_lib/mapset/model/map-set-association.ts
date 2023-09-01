export class MapSetAssociation {
  public id?: number;
  public mapSet?: string;
  public mapSetVersion?: {id?: number, version?: string};
  public source?: MapSetAssociationEntity;
  public target?: MapSetAssociationEntity;
  public relationship?: string;
  public verified?: boolean;
  public noMap?: boolean;
}

export class MapSetAssociationEntity {
  public code?: string;
  public codeSystem?: string;
  public display?: string;
}
