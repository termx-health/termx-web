import {QueryParams} from '@kodality-web/core-util';

export class ValueSetSearchParams extends QueryParams {
  public id?: string;
  public ids?: string;
  public idContains?: string;
  public publisher?: string;
  public uri?: string;
  public uriContains?: string;
  public name?: string;
  public nameContains?: string;
  public description?: string;
  public descriptionContains?: string;

  public text?: string;
  public textContains?: string;

  public versionId?:number;
  public versionVersion?:string;
  public versionStatus?:string;
  public versionSource?:string;

  public decorated?: boolean;

  public lang?: string;

  public codeSystem?: string;
  public conceptCode?: string;

  public spaceId?: number;
  public packageId?: number;
  public packageVersionId?: number;
}
