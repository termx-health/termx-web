import {DefinedProperty} from '../../defined-property';

export class MapSetProperty extends DefinedProperty {
  public status?: string;
  public created?: Date;
  public orderNumber?: number;
  public preferred?: boolean;
  public required?: boolean;

  public definedEntityPropertyId?: number;
}
