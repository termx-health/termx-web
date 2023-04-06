export class ObservationDefinitionMapping {
  public id?: number;
  public target?: ObservationDefinitionMappingTarget;
  public orderNumber?: number;
  public mapSet?: string;
  public codeSystem?: string;
  public concept?: string;
  public relation?: string;
  public condition?: string;
}

export class ObservationDefinitionMappingTarget {
  public type?: string;
  public id?: number;
}
