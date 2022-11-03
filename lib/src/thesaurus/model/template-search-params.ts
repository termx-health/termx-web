import {QueryParams} from '@kodality-web/core-util';

export class TemplateSearchParams extends QueryParams {
  public code?: string;
  public textContains?: string;
}
