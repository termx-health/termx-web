import {QueryParams} from '@kodality-web/core-util';

export class TerminologyServerSearchParams extends QueryParams {
  public spaceId?: number;
  public currentInstallation?: boolean;
  public textContains?: string;
}

