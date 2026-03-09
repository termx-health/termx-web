import {QueryParams} from '@kodality-web/core-util';

export class MapSetAssociationSearchParams extends QueryParams {
  public mapSet?: string;
  public mapSetVersion?: string;
  public relationships?: string;
  public verified?: boolean;
  public noMap?: boolean;
}
