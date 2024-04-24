import {Identifier} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {ValueSetSnapshot} from 'term-web/resources/_lib';
import {ValueSetVersionRuleSet} from './value-set-version-rule-set';

export class ValueSetVersionReference {
  public id?: number;
  public version?: string;
  public valueSet?: string;
}

export class ValueSetVersion extends ValueSetVersionReference {
  public preferredLanguage?: string;
  public supportedLanguages?: string[];
  public description?: LocalizedName;
  public status?: string;
  public releaseDate?: Date;
  public expirationDate?: Date;
  public created?: Date;
  public algorithm?: string;
  public ruleSet?: ValueSetVersionRuleSet;
  public identifiers?: Identifier[];

  public snapshot?: ValueSetSnapshot;
}
