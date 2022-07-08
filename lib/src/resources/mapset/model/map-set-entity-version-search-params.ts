import {QueryParams} from '@kodality-web/core-util';

export class MapSetEntityVersionSearchParams extends QueryParams {
  public mapSetEntityId?: number;
  public mapSetVersionId?: number;
  public mapSetVersion?: string;
  public mapSet?: string;
  public status?: string;
  public descriptionContains?: string;
}