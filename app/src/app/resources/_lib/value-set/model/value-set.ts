import {LocalizedName} from '@kodality-web/marina-util';
import {ValueSetVersion} from './value-set-version';
import {ContactDetail} from '../../contact';
import {Identifier} from '@kodality-web/core-util';

export class ValueSet {
  public id?: string;
  public uri?: string;
  public publisher?: string;
  public name?: string;
  public title?: LocalizedName;
  public otherTitle?: {name?: string, preferred?: boolean}[];
  public description?: LocalizedName;
  public purpose?: LocalizedName;
  public topic?: {text?: string, tags?: string[]};
  public useContext?: {type?: string, value?: string}[];
  public narrative?: string;
  public experimental?: boolean;
  public sourceReference?: string;
  public identifiers?: Identifier[];
  public configurationAttributes?: any[];
  public contacts?: ContactDetail[];

  public versions?: ValueSetVersion[];

  public copyright?: {holder?: string, jurisdiction?: string, statement?: string};
  public permissions?: {admin?: string, editor?: string, viewer?: string, endorser?: string};
  public settings?: {reviewRequired?: boolean, approvalRequired?: boolean};
}
