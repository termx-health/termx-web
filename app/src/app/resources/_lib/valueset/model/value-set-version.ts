import {ValueSetVersionRuleSet} from './value-set-version-rule-set';
import {ValueSetVersionConcept} from './value-set-version-concept';

export class ValueSetVersion {
  public id?: number;
  public valueSet?: string;
  public version?: string;
  public source?: string;
  public supportedLanguages?: string[];
  public description?: string;
  public status?: string;
  public releaseDate?: Date;
  public expirationDate?: Date;
  public created?: Date;

  public ruleSet?: ValueSetVersionRuleSet;
  public concepts?: ValueSetVersionConcept[];
}
