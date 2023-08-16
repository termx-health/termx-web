import {LocalizedName} from '@kodality-web/marina-util';
import {EntityProperty} from '../../codesystem';

export class DefinedEntityProperty {
  public id?: number;
  public name?: string;
  public kind?: string;
  public type?: string;
  public uri?: string;
  public rule?: EntityPropertyRule;
  public description?: LocalizedName;

  public used?: boolean;
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
