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

  public accessInfo?: string;
  public usage?: string[];
  public authoritative?: AuthoritativeResource[];
  public authoritativeValuesets?: AuthoritativeResource[];
  public exclusions?: string[];
  public fhirVersions?: TerminologyServerFhirVersion[];
  public supportedOperations?: string[];
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

export class AuthoritativeResource {
  public url?: string;
  public status?: string;
  public version?: string;
  public name?: string;
}

export class TerminologyServerFhirVersion {
  public version?: string;
  public url?: string;
}
