import {QueryParams} from '@termx-health/core-util';

export class PrivilegeSearchParams extends QueryParams {
  public code?: string;
  public codeContains?: string;
}
