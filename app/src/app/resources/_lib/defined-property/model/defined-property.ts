import {LocalizedName} from '@kodality-web/marina-util';
import {EntityProperty} from '../../code-system';

export class DefinedProperty {
  public id?: number;
  public name?: string;
  public kind?: string;
  public type?: string;
  public uri?: string;
  public rule?: PropertyRule;
  public description?: LocalizedName;

  public used?: boolean;
}

export class PropertyRule {
  public codeSystems?: string[];
  public valueSet?: string;
  public filters?: PropertyRuleFilter[];
}

export class PropertyRuleFilter {
  public type?: string;
  public association?: string;
  public property?: EntityProperty;
  public operator?: string;
  public value?: any;
}
