import {QueryParams} from '@termx-health/core-util';

export class SpaceSearchParams extends QueryParams {
  public codes?: string;
  public textContains?: string;
  public resource?: string;
}
