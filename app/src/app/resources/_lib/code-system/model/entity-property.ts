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
  public extensions?: EntityPropertyValueExtension[];
  public entityPropertyId?: number;
  public entityProperty?: string;

  public supplement?: boolean;
}

export class EntityPropertyValueExtension {
  public url?: string;
  public valueString?: string;
  public valueBoolean?: boolean;
  public valueDecimal?: number;
  public valueInteger?: number;
  public valueDateTime?: string;
  public valueCode?: string;
}
