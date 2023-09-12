import {QueryParams} from '@kodality-web/core-util';

export class PageContentSearchParams extends QueryParams{
  public ids?: string | number;
  public slugs?: string;
  public textContains?: string;
  public spaceIds?: string | number;
}
