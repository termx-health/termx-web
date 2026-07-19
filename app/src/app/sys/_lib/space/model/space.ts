import {LocalizedName} from '@termx-health/util';
import {Package} from 'term-web/sys/_lib/space/model/package';

export class Space {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;
  public active?: boolean;
  public shared?: boolean;
  public globalSearch?: boolean;
  public acl?: {owners?: string, editors?: string, viewers?: string};
  public terminologyServers?: string[];
  public description?: LocalizedName;
  public defaultLanguage?: string;
  public languages?: string[];
  public siteUrl?: string;
  public ssgSkin?: string;
  public ssgThemeAccent?: string;
  public ssgThemeSwitcher?: boolean;
  public ssgFooterMessage?: string;
  public ssgFooterCopyright?: string;
  public ssgTxServer?: string;
  public ssgSearch?: boolean;
  public ssgLogo?: string;
  public packages?: Package[];
  public integration?: {
    github?: {
      repo?: string,
      dirs?: {[key: string]: string}
    };
    msDevops?: {
      repo?: string,
      dirs?: {[key: string]: string}
    };
  };
}
