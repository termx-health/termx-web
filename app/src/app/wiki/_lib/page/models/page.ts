import {PageContent} from './page-content';
import {PageLink} from './page-link';
import {PageTag} from './page-tag';
import {PageRelation} from './page-relation';

export class Page {
  public id?: number;
  public status?: string;
  public templateId?: number;
  public spaceId?: number;
  public leaf?: boolean;
  public contents?: PageContent[];
  public links?: PageLink[];
  public tags?: PageTag[];
  public relations?: PageRelation[];

  public linkPages?: Page[];
  public active?: boolean;

  public createdAt?: Date;
  public createdBy?: string;
  public modifiedAt?: Date;
  public modifiedBy?: string;
}
