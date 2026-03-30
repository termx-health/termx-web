import {QueryParams} from '@termx-health/core-util';

export class ServerSearchParams extends QueryParams {
  public spaceId?: number;
  public codes?: string;
  public kinds?: string;
  public textContains?: string;
  public currentInstallation?: boolean;
}
