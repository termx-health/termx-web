import {QueryParams} from '@kodality-web/core-util';

export class PageSearchParams extends QueryParams{
  public root?: boolean;
  public idNe?: number;
  public rootId?: number;
  public textContains?: string;
  public slug?: string;
}
