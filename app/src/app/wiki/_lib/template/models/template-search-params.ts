import {QueryParams} from '@termx-health/core-util';

export class TemplateSearchParams extends QueryParams {
  public code?: string;
  public textContains?: string;
}
