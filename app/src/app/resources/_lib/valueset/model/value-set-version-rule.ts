import {ValueSetVersionConcept} from './value-set-version-concept';
import {EntityProperty} from '../../codesystem';

export class ValueSetVersionRule {
  public id?: number;
  public type?: string;
  public codeSystem?: string;
  public codeSystemVersionId?: number;
  public concepts?: ValueSetVersionConcept[];
  public filters?: ValueSetRuleFilter[];

  public valueSet?: string;
  public valueSetVersionId?: number;
}

export class ValueSetRuleFilter {
  public property?: EntityProperty;
  public operator?: string;
  public value?: any;
}
