import {ValueSetVersionRuleSet} from './value-set-version-rule-set';
import {LocalizedName} from '@kodality-web/marina-util';
import {ValueSetSnapshot} from 'term-web/resources/_lib';

export class ValueSetVersionReference {
  public id?: number;
  public version?: string;
}

export class ValueSetVersion extends ValueSetVersionReference {
  public valueSet?: string;
  public supportedLanguages?: string[];
  public description?: LocalizedName;
  public status?: string;
  public releaseDate?: Date;
  public expirationDate?: Date;
  public created?: Date;
  public algorithm?: string;
  public ruleSet?: ValueSetVersionRuleSet;

  public snapshot?: ValueSetSnapshot;
}
