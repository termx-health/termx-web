export class PageComment {
  public id?: number;
  public pageContentId?: number;
  public parentId?: number;
  public text?: string;
  public comment?: string;
  public status?: string;
  public options?: {[k:string]: any};
  public readonly replies?: number;

  public createdAt?: Date;
  public createdBy?: string;
  public modifiedAt?: Date;
  public modifiedBy?: string;
}
