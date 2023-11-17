import {QueryParams} from '@kodality-web/core-util';

export class ImplementationGuideSearchParams extends QueryParams {
  public code?: string;
  public textContains?: string;

  public decorated?: boolean;
}
