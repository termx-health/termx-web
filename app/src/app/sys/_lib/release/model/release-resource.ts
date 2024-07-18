import {LocalizedName} from '@kodality-web/marina-util';

export class ReleaseResource {
  public id?: number;
  public resourceType?: string;
  public resourceId?: string;
  public resourceVersion?: string;
  public resourceNames?: LocalizedName;
}
