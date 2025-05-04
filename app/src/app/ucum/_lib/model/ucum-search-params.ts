import {QueryParams} from '@kodality-web/core-util';

export class UcumSearchParams extends QueryParams {
  public code?: string;
  public textContains?: string;
}
