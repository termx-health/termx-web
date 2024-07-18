import {LocalizedName} from '@kodality-web/marina-util';

export class TerminologyServer {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;
  public kind?: string[];
  public rootUrl?: string;
  public headers?: TerminologyServerHeader[];
  public authConfig?: TerminologyServerAuthConfig;
  public active?: boolean;
  public currentInstallation?: boolean;
}

export class TerminologyServerHeader {
  public key?: string;
  public value?: string;
}

export class TerminologyServerAuthConfig {
  public accessTokenUrl?: string;
  public clientId?: string;
  public clientSecret?: string;
}
