import {QueryParams} from '@kodality-web/core-util';

export class ValueSetSearchParams extends QueryParams {
  public id?: string;
  public idContains?: string;
  public uri?: string;
  public uriContains?: string;
  public name?: string;
  public nameContains?: string;
  public description?: string;
  public descriptionContains?: string;

  public text?: string;
  public textContains?: string;

  public decorated?: boolean;

  public lang?: string;
}
