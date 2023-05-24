import {QueryParams} from '@kodality-web/core-util';

export class WorkflowSearchParams extends QueryParams {
  public ids?: string;
  public spaceIds?: string;
  public types?: string;
}
