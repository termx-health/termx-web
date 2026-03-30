import {LocalizedName} from '@termx-health/util';

export class Server {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;
  public kind?: string[];
  public rootUrl?: string;
  public headers?: ServerHeader[];
  public authConfig?: ServerAuthConfig;
  public active?: boolean;
  public currentInstallation?: boolean;

  public accessInfo?: string;
  public usage?: string[];
  public authoritative?: AuthoritativeResource[];
  public authoritativeValuesets?: AuthoritativeResource[];
  public authoritativeConceptmaps?: AuthoritativeResource[];
  public authoritativeStructuredefinitions?: AuthoritativeResource[];
  public authoritativeStructuremaps?: AuthoritativeResource[];
  public exclusions?: string[];
  public fhirVersions?: ServerFhirVersion[];
  public supportedOperations?: string[];
  public cachePeriodHours?: number;
  public strategy?: string;
  public open?: boolean;
  public token?: boolean;
  public oauthFlag?: boolean;
  public smartFlag?: boolean;
  public certFlag?: boolean;
}

export class ServerHeader {
  public key?: string;
  public value?: string;
}

export class ServerAuthConfig {
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

export class ServerFhirVersion {
  public version?: string;
  public url?: string;
}
