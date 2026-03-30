import {LocalizedName} from '@termx-health/util';
import {PrivilegeResource} from 'term-web/privileges/_lib/model/privilege-resource';

export class Privilege {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;

  public resources?: PrivilegeResource[];
}
