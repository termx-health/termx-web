export class EntityProperty {
  public id?: number;
  public name?: string;
  public kind?: string;
  public type?: string;
  public description?: string;
  public status?: string;
  public created?: Date;

  public orderNumber?: number;
  public preferred?: boolean;
  public required?: boolean;

  public rule?: EntityPropertyRule;

  public supplementId?: number;
}

export class EntityPropertyRule {
  public codeSystems?: string[];
  public valueSet?: string;
  public filters?: EntityPropertyRuleFilter[];
}

export class EntityPropertyRuleFilter {
  public type?: string;
  public association?: string;
  public property?: EntityProperty;
  public operator?: string;
  public value?: any;
}

export class EntityPropertyValue {
  public id?: number;
  public value?: any;
  public entityPropertyId?: number;
  public entityProperty?: string;

  public supplementId?: number;
}
