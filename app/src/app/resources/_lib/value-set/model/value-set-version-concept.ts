import {CodeSystemConcept} from '../../code-system';
import {Designation} from '../../designation';

export class ValueSetVersionConcept {
  public id?: number;
  public concept?: CodeSystemConcept;
  public display?: Designation;
  public additionalDesignations?: Designation[];
  public orderNumber?: number;

  public active?: boolean;
}
