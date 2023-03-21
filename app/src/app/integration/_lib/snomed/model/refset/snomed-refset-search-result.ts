import {SnomedConcept} from '../concept/snomed-concept';
import {SnomedRefsetItem} from './snomed-refset-item';

export class SnomedRefsetSearchResult {
  public memberCountsByReferenceSet?: { [key: string]: number };
  public referenceSets?: { [key: string]: SnomedConcept };
  public items?: SnomedRefsetItem[];
}
