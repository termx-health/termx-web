import {QueryParams} from '@kodality-web/core-util';

export class TransformationDefinitionQueryParams extends QueryParams {
  public ids?: string | number;
  public name?: string | number;
  public nameContains?: string;
  public summary?: boolean;
  public spaceId?: number;
  public packageId?: number;
  public packageVersionId?: number;
}

