import {QueryParams} from '@termx-health/core-util';

export class ValueSetVersionRuleSearchParams extends QueryParams{
  public id?: number;
  public codeSystem?: string;
  public codeSystemVersionIds?: string;
  public valueSet?: string;
  public valueSetVersionIds?: string;
}
