export class PageContent {
  public id?: number;
  public pageId?: number;
  public spaceId?: number;
  public name?: string;
  public slug?: string;
  public lang?: string;
  public content?: string;
  public contentType?: 'markdown' | 'html';
  public description?: string;

  public createdAt?: Date;
  public createdBy?: string;
  public modifiedAt?: Date;
  public modifiedBy?: string;
}
