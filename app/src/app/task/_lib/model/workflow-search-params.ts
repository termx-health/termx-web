import {QueryParams} from '@termx-health/core-util';

export class WorkflowSearchParams extends QueryParams {
  public ids?: string;
  public projectIds?: string;
  public types?: string;
}
