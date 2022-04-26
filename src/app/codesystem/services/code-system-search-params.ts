import {QueryParams} from '@kodality-web/core-util';

export class CodeSystemSearchParams extends QueryParams {
  public name?: string;
  public decorated?: boolean;
}
