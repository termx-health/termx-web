import {QueryParams} from '@kodality-web/core-util';

export class PageCommentSearchParams extends QueryParams {
  public ids?: string | number;
  public parentIds?: string | number;
  public pageContentIds?: string | number;
  public statuses?: string;
  public statusesNe?: string;
  public contentContains?: string;
  public replies?: boolean;
}
