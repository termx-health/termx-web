import {LocalizedName} from '@kodality-web/marina-util';
import {Package} from './package';

export class Project {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;
  public active?: boolean;
  public shared?: boolean;
  public acl?: {owners?: string, editors?: string, viewers?: string};
  public terminologyServers?: string[];
  public packages?: Package[];
}
