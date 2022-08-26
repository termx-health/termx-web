import {CodeSystemConcept} from '../../codesystem';
import {Designation} from '../../designation';

export class ValueSetVersionConcept {
  public id?: number;
  public concept?: CodeSystemConcept;
  public display?: Designation;
  public additionalDesignations?: Designation[];
  public active?: boolean;
}
