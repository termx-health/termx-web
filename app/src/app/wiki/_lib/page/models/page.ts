import {PageContent} from 'term-web/wiki/_lib/page/models/page-content';
import {PageLink} from 'term-web/wiki/_lib/page/models/page-link';
import {PageRelation} from 'term-web/wiki/_lib/page/models/page-relation';
import {PageTag} from 'term-web/wiki/_lib/page/models/page-tag';

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
