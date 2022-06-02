import {Designation} from '../../designation';
import {CodeSystemConcept, EntityProperty} from '../../codesystem';

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

  public ruleSet?: ValueSetRuleSet;
  public concepts?: ValueSetConcept[];
}

export class ValueSetRuleSet {
  public lockedDate?: Date;
  public inactive?: Boolean;
  public includeRules?: ValueSetRule[];
  public excludeRules?: ValueSetRule[];
}

export class ValueSetRule {
  public codeSystem?: string;
  public codeSystemVersion?: string;
  public concepts?: ValueSetConcept[];
  public filters?: ValueSetRuleFilter[];

  public valueSet?: string;
  public valueSetVersion?: string;
}

export class ValueSetRuleFilter {
  public property?: EntityProperty;
  public operator?: string;
  public value?: string;
}

export class ValueSetConcept {
  public concept?: CodeSystemConcept;
  public display?: string;
  public additionalDesignations?: Designation;
}
