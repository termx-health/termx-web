import {CodeSystemConcept} from 'term-web/resources/_lib/code-system';
import {Designation} from 'term-web/resources/_lib/designation';

export class ValueSetVersionConcept {
  public id?: number;
  public concept?: CodeSystemConcept;
  public display?: Designation;
  public additionalDesignations?: Designation[];
  public orderNumber?: number;

  public active?: boolean;
}
