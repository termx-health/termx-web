import {QueryParams} from '@kodality-web/core-util';

export class ChecklistRuleSearchParams extends QueryParams {
  public resourceType?: string;
  public textContains?: string;
}
