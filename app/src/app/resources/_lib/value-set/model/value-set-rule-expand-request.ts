import {ValueSetVersionRule} from 'term-web/resources/_lib/value-set/model/value-set-version-rule';

export class ValueSetRuleExpandRequest {
  public valueSet?: string;
  public valueSetVersion?: string;
  public inactiveConcepts?: boolean;
  public rule?: ValueSetVersionRule;
}
