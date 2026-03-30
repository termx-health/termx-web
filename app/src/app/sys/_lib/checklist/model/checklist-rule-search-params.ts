import {QueryParams} from '@termx-health/core-util';

export class ChecklistRuleSearchParams extends QueryParams {
  public resourceType?: string;
  public textContains?: string;
}
