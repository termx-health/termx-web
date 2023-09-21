import {QueryParams} from '@kodality-web/core-util';

export class EntityPropertySearchParams extends QueryParams {
  public ids?: string;
  public names?: string;
  public codeSystem?: string;
}
