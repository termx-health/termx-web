import {QueryParams} from '@kodality-web/core-util';

export class TerminologyServerSearchParams extends QueryParams {
  public spaceId?: number;
  public codes?: string;
  public kinds?: string;
  public textContains?: string;
  public currentInstallation?: boolean;
}

