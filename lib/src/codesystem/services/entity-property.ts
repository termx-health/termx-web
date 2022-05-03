export class EntityProperty {
  public id?: number;
  public name?: string;
  public type?: string;
  public description?: string;
  public status?: string;
  public created?: Date;
}

export class EntityPropertyValue{
  public id?: number;
  public value?: object;
  public entityPropertyId?: number;
}