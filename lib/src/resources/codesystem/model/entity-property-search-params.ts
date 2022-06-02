import {QueryParams} from '@kodality-web/core-util';

export class EntityPropertySearchParams extends QueryParams{
  public name?: string;
  public codeSystem?: string;
  public valueSet?: string;
}
