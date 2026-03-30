import {QueryParams} from '@termx-health/core-util';

export class ChecklistSearchParams extends QueryParams {
  public resourceType?: string;
  public resourceId?: string;
  public resourceVersion?: string;

  public assertionsDecorated?: boolean;
}
