import {QueryParams} from '@kodality-web/core-util';

export class SpaceSearchParams extends QueryParams {
  public codes?: string;
  public textContains?: string;
  public resource?: string;
}
