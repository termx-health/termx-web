export class EntityProperty {
  public id?: number;
  public name?: string;
  public type?: string;
  public description?: string;
  public status?: string;
  public created?: Date;

  public supplementId?: number;
}

export class EntityPropertyValue {
  public id?: number;
  public value?: string;
  public entityPropertyId?: number;

  public supplementId?: number;
}