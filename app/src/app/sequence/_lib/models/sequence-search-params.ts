import {QueryParams} from '@kodality-web/core-util';

export class SequenceSearchParams extends QueryParams {
  public textContains?: string;
  public codes?: string;
}
