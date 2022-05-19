import {QueryParams} from '@kodality-web/core-util';

export class ValueSetSearchParams extends QueryParams {
  public name?: string;
  public textContains?: string;
  public decorated?: boolean;
}
