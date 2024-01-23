import {QueryParams} from '@kodality-web/core-util';

export class ChecklistSearchParams extends QueryParams {
  public resourceType?: string;
  public resourceId?: string;

  public assertionsDecorated?: boolean;
}
