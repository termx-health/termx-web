import {LocalizedName} from '@kodality-health/marina-util';

export class CodeSystem {
  public id?: string;
  public uri?: string;
  public names?: LocalizedName;
  public description?: string;
  public sys_created_at?: Date;
  public sys_created_by?: string;
  public sys_modified_at?:  Date;
  public sys_modified_by?:  string;
  public sys_status?:  string;
  public sys_version?:  number;
}

