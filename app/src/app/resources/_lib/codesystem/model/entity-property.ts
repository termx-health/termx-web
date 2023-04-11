export class EntityProperty {
  public id?: number;
  public name?: string;
  public type?: string;
  public description?: string;
  public status?: string;
  public created?: Date;

  public orderNumber?: number;
  public preferred?: boolean;
  public required?: boolean;

  public supplementId?: number;
}

export class EntityPropertyValue {
  public id?: number;
  public value?: any;
  public entityPropertyId?: number;
  public entityProperty?: string;

  public supplementId?: number;
}
