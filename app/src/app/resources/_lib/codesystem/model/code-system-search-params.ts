import {QueryParams} from '@kodality-web/core-util';

export class CodeSystemSearchParams extends QueryParams {
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

  public conceptCode?: string;
  public conceptCodeSystemVersion?: string;
  public conceptsDecorated?: boolean;

  public versionId?: number;
  public versionVersion?: string;
  public versionReleaseDateGe?: Date;
  public versionExpirationDateLe?: Date;
  public versionsDecorated?: boolean;

  public propertiesDecorated?: boolean;

  public codeSystemEntityVersionId?: number;

  public lang?: string;

  public projectId?: number;
  public packageId?: number;
  public packageVersionId?: number;
}
