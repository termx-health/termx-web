import {QueryParams} from '@kodality-web/core-util';

export class PrivilegeSearchParams extends QueryParams {
  public code?: string;
  public codeContains?: string;
}
