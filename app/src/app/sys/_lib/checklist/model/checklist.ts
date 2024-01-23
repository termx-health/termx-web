import {ChecklistAssertion, ChecklistRule} from 'term-web/sys/_lib';

export class Checklist {
  public id?: number;
  public rule?: ChecklistRule;
  public resourceType?: string;
  public resourceId?: string;
  public whitelist?: ChecklistWhitelist[];
  public assertions?: ChecklistAssertion[];
}

export class ChecklistWhitelist {
  public id?: number;
  public resourceType?: string;
  public resourceId?: string;
  public resourceName?: string;
}
