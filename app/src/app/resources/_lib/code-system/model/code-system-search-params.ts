import {QueryParams} from '@kodality-web/core-util';

export class CodeSystemSearchParams extends QueryParams {
  public id?: string;
  public ids?: string;
  public idContains?: string;
  public publisher?: string;
  public uri?: string;
  public uriContains?: string;
  public content?: string;
  public name?: string;
  public nameContains?: string;
  public title?: string;
  public titleContains?: string;
  public description?: string;
  public descriptionContains?: string;
  public baseCodeSystem?: string;

  public text?: string;
  public textContains?: string;

  public conceptCode?: string;
  public conceptCodeSystemVersion?: string;
  public conceptsDecorated?: boolean;

  public versionId?: number;
  public versionVersion?: string;
  public versionStatus?: string;
  public versionReleaseDateGe?: Date;
  public versionExpirationDateLe?: Date;
  public versionsDecorated?: boolean;

  public propertiesDecorated?: boolean;

  public codeSystemEntityVersionId?: number;

  public lang?: string;

  public spaceId?: number;
  public packageId?: number;
  public packageVersionId?: number;
}
