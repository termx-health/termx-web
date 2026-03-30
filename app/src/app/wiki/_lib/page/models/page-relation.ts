import {CodeName} from '@termx-health/util';

export class PageRelation {
  public id?: number;
  public pageId?: number;
  public spaceId?: number;
  public content?: CodeName;
  public target?: string;
  public type?: string;
}
