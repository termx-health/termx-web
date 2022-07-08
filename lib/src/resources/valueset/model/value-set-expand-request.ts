import {ValueSetRuleSet} from './value-set-version';

export class ValueSetExpandRequest {
  public valueSet?: string;
  public valueSetVersion?: string;
  public ruleSet?: ValueSetRuleSet;
}
