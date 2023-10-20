export class PageContentHistoryItem {
  public id?: number;
  public pageContentId?: number;
  public pageId?: number;
  public spaceId?: number;
  public name?: string;
  public slug?: string;
  public lang?: string;
  public content?: string;
  public contentType?: string;

  public createdAt?: Date;
  public createdBy?: string;
  public modifiedAt?: Date;
  public modifiedBy?: string;
}
