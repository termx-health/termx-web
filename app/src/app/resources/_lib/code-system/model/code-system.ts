import {EntityProperty} from './entity-property';
import {CodeSystemVersion} from './code-system-version';
import {CodeSystemConcept} from './code-system-concept';
import {ContactDetail} from '../../contact/model/contact-detail';
import {LocalizedName} from '@kodality-web/marina-util';
import {Identifier} from '@kodality-web/core-util';

export class CodeSystem {
  public id?: string;
  public uri?: string;
  public name?: string;
  public title?: LocalizedName;
  public publisher?: string;
  public description?: LocalizedName;
  public purpose?: LocalizedName;
  public experimental?: boolean;
  public content?: string;
  public caseSensitive?: string;
  public narrative?: string;
  public baseCodeSystem?: string;
  public hierarchyMeaning?: string;
  public sequence?: string;
  public identifiers?: Identifier[];
  public contacts?: ContactDetail[];
  public properties?: EntityProperty[];

  public concepts?: CodeSystemConcept[];
  public versions?: CodeSystemVersion[];

  public copyright?: {holder?: string, jurisdiction?: string, statement?: string};
  public permissions?: {admin?: any, editor?: any, viewer?: any};
  public settings?: {reviewRequired?: boolean, approvalRequired?: boolean};
}
