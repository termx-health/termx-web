import {DefinedProperty} from 'term-web/resources/_lib/defined-property/model/defined-property';

export class EntityProperty extends DefinedProperty {
  public status?: string;
  public created?: Date;
  public orderNumber?: number;
  public preferred?: boolean;
  public required?: boolean;
  public showInList?: boolean;

  public definedEntityPropertyId?: number;
}

export class EntityPropertyValue {
  public id?: number;
  public value?: any;
  public entityPropertyId?: number;
  public entityProperty?: string;

  public supplementId?: number;
}
