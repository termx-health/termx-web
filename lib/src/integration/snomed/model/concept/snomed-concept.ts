import {SnomedDescription} from '../description/snomed-description';
import {SnomedRelationship} from '../relationship/snomed-relationship';

export class SnomedConcept {
  public id?: string;
  public effectiveTime?: string;
  public active?: boolean;
  public moduleId?: string;

  public definitionStatus?: string;
  public conceptId?: string;
  public pt?: {term?: string, lang?: string};
  public fsn?: {term?: string, lang?: string};
  public descriptions?: SnomedDescription[] = [];
  public relationships?: SnomedRelationship[] = [];

  public isLeafInferred?: boolean;

  public target?: string;
}
