import {QueryParams} from '@kodality-web/core-util';

export class TaskSearchParams extends QueryParams {
  public ids?: string;
  public textContains?: string;
  public statuses?: string;
  public statusesNe?: string;
  public projectIds?: string;
  public priorities?: string;
  public types?: string;
  public context?: string;
  public createdGe?: Date;
  public createdLe?: Date;
  public createdBy?: string;
  public modifiedGe?: Date;
  public modifiedLe?: Date;
  public assignees?: string;
}
