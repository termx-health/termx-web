import {QueryParams} from '@termx-health/core-util';

export class ReleaseSearchParams extends QueryParams {
  public textContains?: string;
  public status?: string;
  public resource?: string; //type|id|version
}
