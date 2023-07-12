import {QueryParams} from '@kodality-web/core-util';

export class PageLinkSearchParams extends QueryParams {
  public root?: boolean;
  public sourceIds?: string;
  public targetIds?: string;
  public spaceIds?: string | number;
}
