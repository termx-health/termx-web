import {SnomedConcept} from '../concept/snomed-concept';

export class SnomedDescriptionSearchResult {
  public buckets?: {
    module: { [key: string]: number},
    semanticTags: { [key: string]: number},
    language: { [key: string]: number},
    membership: { [key: string]: number},
    languageNames: { [key: string]: string},
    bucketConcepts: { [key: string]: SnomedConcept}
  };
  public items?: {term: string, active: boolean, concept: SnomedConcept}[];
}
