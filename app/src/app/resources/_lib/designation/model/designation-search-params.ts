import {QueryParams} from '@kodality-web/core-util';

export class DesignationSearchParams extends QueryParams {
  public id?: string;
  public valueSet?: string;
  public valueSetVersion?: string;
  public conceptId?: number;
  public conceptCode?: string;
}
