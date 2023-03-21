import {Designation} from '../../designation';
import {CodeSystemConcept} from '../../codesystem';

export class ValueSetVersionConcept {
  public id?: number;
  public concept?: CodeSystemConcept;
  public display?: Designation;
  public additionalDesignations?: Designation[];
  public active?: boolean;
}
