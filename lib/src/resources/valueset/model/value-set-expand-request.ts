import {ValueSetVersionRuleSet} from './value-set-version-rule-set';

export class ValueSetExpandRequest {
  public valueSet?: string;
  public valueSetVersion?: string;
  public ruleSet?: ValueSetVersionRuleSet;
}
