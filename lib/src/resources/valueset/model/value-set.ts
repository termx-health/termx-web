import {LocalizedName} from '@kodality-health/marina-util';
import {ValueSetVersion} from './value-set-version';
import {ContactDetail} from '../../contact/model/contact-detail';

export class ValueSet {
  public id?: string;
  public names?: LocalizedName;
  public uri?: string;
  public description?: string;
  public status?: string;
  public versions?: ValueSetVersion[];
  public contacts?: ContactDetail[];
}
