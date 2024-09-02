import {Identifier} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {ContactDetail} from '../../contact/model/contact-detail';
import {CodeSystemConcept} from './code-system-concept';
import {CodeSystemVersion} from './code-system-version';
import {EntityProperty} from './entity-property';

export class CodeSystem {
  public id?: string;
  public uri?: string;
  public name?: string;
  public title?: LocalizedName;
  public otherTitle?: {name?: string, preferred?: boolean}[];
  public publisher?: string;
  public description?: LocalizedName;
  public purpose?: LocalizedName;
  public topic?: {text?: string, tags?: string[]};
  public useContext?: {type?: string, value?: string}[];
  public experimental?: boolean;
  public sourceReference?: string;
  public content?: string;
  public caseSensitive?: string;
  public narrative?: string;
  public baseCodeSystem?: string;
  public hierarchyMeaning?: string;
  public sequence?: string;
  public identifiers?: Identifier[];
  public configurationAttributes?: any[];
  public contacts?: ContactDetail[];
  public properties?: EntityProperty[];

  public concepts?: CodeSystemConcept[];
  public versions?: CodeSystemVersion[];

  public valueSet?: string;

  public copyright?: {holder?: string, jurisdiction?: string, statement?: string};
  public permissions?: {admin?: string, editor?: string, viewer?: string, endorser?: string};
  public settings?: {reviewRequired?: boolean, approvalRequired?: boolean, disableHierarchyGrouping?: boolean};
}
