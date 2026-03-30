import {Identifier} from '@termx-health/core-util';
import {LocalizedName} from '@termx-health/util';
import {ContactDetail} from 'term-web/resources/_lib/contact';
import {ValueSetVersion} from 'term-web/resources/_lib/value-set/model/value-set-version';

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
