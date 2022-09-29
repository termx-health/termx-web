import {PageContent} from './page-content';
import {PageRelation} from './page-relation';

export class Page {
  public id?: number;
  public status?: string;
  public leaf?: boolean;
  public contents?: PageContent[];
  public relations?: PageRelation[];

  public relationPages?: Page[];
  public active?: boolean;
}
