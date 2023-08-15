import {DefinedEntityProperty} from 'term-web/resources/_lib/definedentityproperty/model/defined-entity-property';

export class EntityProperty extends DefinedEntityProperty{
  public status?: string;
  public created?: Date;
  public orderNumber?: number;
  public preferred?: boolean;
  public required?: boolean;

  public definedEntityPropertyId?: number;
}

export class EntityPropertyValue {
  public id?: number;
  public value?: any;
  public entityPropertyId?: number;
  public entityProperty?: string;

  public supplementId?: number;
}
