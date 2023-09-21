import {Designation} from '../../designation';
import {CodeSystemConcept} from '../../code-system';

export class ValueSetVersionConcept {
  public id?: number;
  public concept?: CodeSystemConcept;
  public display?: Designation;
  public additionalDesignations?: Designation[];
  public orderNumber?: number;

  public active?: boolean;
}
