import {QueryParams} from '@kodality-web/core-util';

export class PageContentSearchParams extends QueryParams{
  public slugs?: string;
  public textContains?: string;
  public spaceIds?: string | number;
}
