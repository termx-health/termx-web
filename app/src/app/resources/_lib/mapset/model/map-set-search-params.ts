import {QueryParams} from '@kodality-web/core-util';


export class MapSetSearchParams extends QueryParams {
  public id?: string;
  public ids?: string;
  public idContains?: string;
  public uri?: string;
  public uriContains?: string;
  public name?: string;
  public nameContains?: string;
  public description?: string;
  public descriptionContains?: string;

  public text?: string;
  public textContains?: string;

  public associationSourceCode?: string;
  public associationSourceSystem?: string;
  public associationSourceSystemUri?: string;
  public associationSourceSystemVersion?: string;
  public associationTargetCode?: string;
  public associationTargetSystem?: string;
  public associationTargetSystemUri?: string;
  public associationTargetSystemVersion?: string;
  public associationsDecorated?: boolean;

  public versionVersion?: string;
  public versionsDecorated?: boolean;

  public lang?: string;

  public spaceId?: number;
  public packageId?: number;
  public packageVersionId?: number;
}
