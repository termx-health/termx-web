import {LocalizedName} from '@kodality-web/marina-util';
import {Package} from './package';

export class Space {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;
  public active?: boolean;
  public shared?: boolean;
  public acl?: {owners?: string, editors?: string, viewers?: string};
  public terminologyServers?: string[];
  public packages?: Package[];
  public integration?: {
    github?: {
      repo?: string,
      dirs?: {[key: string]: string}
    };
  };
}
