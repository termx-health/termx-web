import {QueryParams} from '@kodality-web/core-util';

export class NamingSystemSearchParams extends QueryParams {
  public id?: string;
  public idContains?: string;
  public name?: string;
  public nameContains?: string;
  public source?: string;
  public sourceContains?: string;
  public kind?: string;
  public kindContains?: string;
  public status?: string;
  public statusContains?: string;
  public description?: string;
  public descriptionContains?: string;
  public codeSystem?: string;
  public codeSystemContains?: string;

  public text?: string;
  public textContains?: string;
}
