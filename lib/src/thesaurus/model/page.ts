import {PageContent} from './page-content';
import {PageLink} from './page-link';

export class Page {
  public id?: number;
  public status?: string;
  public leaf?: boolean;
  public contents?: PageContent[];
  public links?: PageLink[];

  public linkPages?: Page[];
  public active?: boolean;
}
