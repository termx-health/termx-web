import {LocalizedName} from '@kodality-web/marina-util';
import {EntityProperty} from './entity-property';
import {CodeSystemVersion} from './code-system-version';
import {CodeSystemConcept} from './code-system-concept';
import {ContactDetail} from '../../contact/model/contact-detail';

export class CodeSystem {
  public id?: string;
  public uri?: string;
  public names?: LocalizedName;
  public content?: string;
  public caseSensitive?: string;
  public narrative?: string;
  public description?: string;
  public baseCodeSystem?: string;
  public contacts?: ContactDetail[];
  public supportedLanguages?: string[];

  public concepts?: CodeSystemConcept[];
  public properties?: EntityProperty[];
  public versions?: CodeSystemVersion[];

}
