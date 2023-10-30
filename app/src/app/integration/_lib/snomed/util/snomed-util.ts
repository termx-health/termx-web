import {SnomedConcept} from '../model/concept/snomed-concept';

export class SnomedUtil {

  public static formatConcept(concept: SnomedConcept, type: 'pt' | 'fsn' = 'pt'): string {
    if (type == 'pt') {
      return concept.pt?.term || concept.fsn?.term || concept.conceptId;
    }
    if (type == 'fsn') {
      return concept.fsn?.term || concept.pt?.term || concept.conceptId;
    }
    return concept.conceptId;
  }
}
