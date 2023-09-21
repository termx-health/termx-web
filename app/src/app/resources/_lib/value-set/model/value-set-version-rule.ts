import {CodeSystemVersionReference, EntityProperty} from '../../code-system';
import {ValueSetVersionConcept, ValueSetVersionReference} from 'term-web/resources/_lib';

export class ValueSetVersionRule {
  public id?: number;
  public type?: string;
  public codeSystem?: string;
  public codeSystemVersion?: CodeSystemVersionReference;
  public properties?: string[];
  public concepts?: ValueSetVersionConcept[];
  public filters?: ValueSetRuleFilter[];

  public valueSet?: string;
  public valueSetVersion?: ValueSetVersionReference;
}

export class ValueSetRuleFilter {
  public property?: EntityProperty;
  public operator?: string;
  public value?: any;
}
