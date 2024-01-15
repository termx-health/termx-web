import {LocalizedName} from '@kodality-web/marina-util';

export class ChecklistRule {
  public id?: number;
  public code?: string;
  public title?: LocalizedName;
  public description?: LocalizedName;
  public active?: boolean;
  public type?: string;
  public verification?: string;
  public severity?: string;
  public target?: string;
  public resourceType?: string;
}
