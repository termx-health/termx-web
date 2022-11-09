import {ChefMessage} from './chef-message';

export class FhirToFshResponse {
  public fsh?: string | fshMap;
  public configuration?: any;
  public errors?: ChefMessage[];
  public warnings?: ChefMessage[];
}

export class ErrorAndWarning {
  public message?: string;
  public location?: {startLine: number, startColumn: number, endLine: number, endColumn: number};
  public input?: string;
}

export type fshMap = {
  aliases: string;
  invariants: ResourceMap;
  mappings: ResourceMap;
  profiles: ResourceMap;
  extensions: ResourceMap;
  logicals: ResourceMap;
  resources: ResourceMap;
  codeSystems: ResourceMap;
  valueSets: ResourceMap;
  instances: ResourceMap;
};

export declare class ResourceMap extends Map<string, string> {
  public toJSON(): Record<string, any>;
}
