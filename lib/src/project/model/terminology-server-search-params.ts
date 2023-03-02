import {QueryParams} from '@kodality-web/core-util';

export class TerminologyServerSearchParams extends QueryParams {
  public projectId?: number;
  public currentInstallation?: boolean;
  public textContains?: string;
}

