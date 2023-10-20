import {PageContent} from './page-content';
import {PageLink} from './page-link';
import {PageTag} from './page-tag';
import {PageRelation} from './page-relation';

export class Page {
  public id?: number;
  public spaceId?: number;

  public status?: string;
  public settings?: PageSettings;
  public leaf?: boolean;

  public contents?: PageContent[];
  public links?: PageLink[];
  public tags?: PageTag[];
  public relations?: PageRelation[];
}


export class PageSettings {
  public templateId?: number;
}


export class PageAttachment {
  public fileId?: number;
  public fileName?: string;
  public contentType?: string;
}
