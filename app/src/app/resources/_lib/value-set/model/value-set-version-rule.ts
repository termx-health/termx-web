import {ValueSetVersionConcept, ValueSetVersionReference} from 'term-web/resources/_lib';
import {CodeSystemVersionReference, EntityProperty} from 'term-web/resources/_lib/code-system';

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
