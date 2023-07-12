import {LocalizedName} from '@kodality-web/marina-util';

export class TerminologyServer {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;
  public kind?: string[];
  public rootUrl?: string;
  public active?: boolean;
  public currentInstallation?: boolean;

}
