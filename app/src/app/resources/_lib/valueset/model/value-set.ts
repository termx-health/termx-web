import {LocalizedName} from '@kodality-web/marina-util';
import {ValueSetVersion} from './value-set-version';
import {ContactDetail} from '../../contact';

export class ValueSet {
  public id?: string;
  public names?: LocalizedName;
  public uri?: string;
  public description?: string;
  public narrative?: string;
  public status?: string;
  public versions?: ValueSetVersion[];
  public contacts?: ContactDetail[];
}
