import {QueryParams} from '@termx-health/core-util';

export class EntityPropertySearchParams extends QueryParams {
  public ids?: string;
  public names?: string;
  public codeSystem?: string;
}
