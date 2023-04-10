import {QueryParams} from '@kodality-web/core-util';

export class ValueSetVersionRuleSearchParams extends QueryParams{
  public id?: number;
  public codeSystem?: string;
  public codeSystemVersionIds?: string;
  public valueSet?: string;
  public valueSetVersionIds?: string;
}
