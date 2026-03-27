import {QueryParams} from '@kodality-web/core-util';

export class ServerSearchParams extends QueryParams {
  public spaceId?: number;
  public codes?: string;
  public kinds?: string;
  public textContains?: string;
  public currentInstallation?: boolean;
}
