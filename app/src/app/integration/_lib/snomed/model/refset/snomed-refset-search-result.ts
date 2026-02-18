import {SnomedConcept} from 'term-web/integration/_lib/snomed/model/concept/snomed-concept';
import {SnomedRefsetItem} from 'term-web/integration/_lib/snomed/model/refset/snomed-refset-item';

export class SnomedRefsetSearchResult {
  public memberCountsByReferenceSet?: { [key: string]: number };
  public referenceSets?: { [key: string]: SnomedConcept };
  public items?: SnomedRefsetItem[];
}
