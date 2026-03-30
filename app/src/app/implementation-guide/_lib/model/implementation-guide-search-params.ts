import {QueryParams} from '@termx-health/core-util';

export class ImplementationGuideSearchParams extends QueryParams {
  public code?: string;
  public textContains?: string;

  public decorated?: boolean;
}
