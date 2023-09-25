export class PageTreeItem {
  public pageId?: number;
  public parentPageId?: number;
  public contents: {
    [lang: string]: {
      id?: number,
      name?: string,
      slug?: string
    }
  };
  public children?: PageTreeItem[];
}
