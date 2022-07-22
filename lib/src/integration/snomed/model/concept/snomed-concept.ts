import {SnomedDescription} from '../description/snomed-description';
import {SnomedRelationship} from '../snomed-relationship';

export class SnomedConcept {
  public id?: string;
  public effectiveTime?: string;
  public active?: boolean;
  public moduleId?: string;

  public definitionStatus?: string;
  public conceptId?: string;
  public pt?: any;
  public fsn?: any;
  public descriptions?: SnomedDescription[] = [];
  public relationships?: SnomedRelationship[] = [];

  public isLeafInferred?: boolean;

  public target?: string;
}
