import {ValueSetVersionRule} from 'term-web/resources/_lib/value-set/model/value-set-version-rule';

export class ValueSetVersionRuleSet {
  public id?: number;
  public lockedDate?: Date;
  public inactive?: boolean;
  public rules?: ValueSetVersionRule[];
}
