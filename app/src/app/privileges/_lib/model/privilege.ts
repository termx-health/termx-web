import {LocalizedName} from '@kodality-web/marina-util';
import {PrivilegeResource} from 'term-web/privileges/_lib/model/privilege-resource';

export class Privilege {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;

  public resources?: PrivilegeResource[];
}
