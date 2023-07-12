import {QueryParams} from '@kodality-web/core-util';

export class PageSearchParams extends QueryParams{
  public root?: boolean;
  public ids?: string;
  public idsNe?: string | number;
  public spaceIds?: string | number;
  public rootId?: number;
  public textContains?: string;
  public slugs?: string;
}
