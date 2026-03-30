import {LocalizedName} from '@termx-health/util';

export class ReleaseResource {
  public id?: number;
  public resourceType?: string;
  public resourceId?: string;
  public resourceVersion?: string;
  public resourceNames?: LocalizedName;
}
