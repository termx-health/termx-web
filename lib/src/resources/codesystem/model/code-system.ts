import {LocalizedName} from '@kodality-health/marina-util';
import {EntityProperty} from './entity-property';
import {CodeSystemVersion} from './code-system-version';
import {CodeSystemConcept} from './code-system-concept';
import {CodeSystemContactDetail} from './code-system-contact-detail';

export class CodeSystem {
  public id?: string;
  public uri?: string;
  public names?: LocalizedName;
  public content?: string;
  public caseSensitive?: string;
  public narrative?: string;
  public description?: string;
  public contacts?: CodeSystemContactDetail[];

  public concepts?: CodeSystemConcept[];
  public properties?: EntityProperty[];
  public versions?: CodeSystemVersion[];

}
