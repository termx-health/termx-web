import {LocalizedName} from '@kodality-health/marina-util';
import {EntityProperty} from './entity-property';
import {CodeSystemVersion} from './code-system-version';
import {CodeSystemConcept} from './code-system-concept';

export class CodeSystem {
  public id?: string;
  public uri?: string;
  public names?: LocalizedName;
  public description?: string;
  public concepts?: CodeSystemConcept[];
  public properties?: EntityProperty[];
  public versions?: CodeSystemVersion[];

}
