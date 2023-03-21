import {SnomedConcept} from '../model/concept/snomed-concept';

export class SnomedUtil {

  public static formatConcept(concept: SnomedConcept, type: 'pt' | 'fsn' = 'pt'): string {
    const etDescription = concept && concept.descriptions && concept.descriptions.find(d => d.lang === 'et');
    const description = etDescription ? etDescription.term : (concept && concept.pt && concept.pt.lang === 'et' ? concept.pt.term : concept && concept[type]?.term);
    return description ? description : concept.conceptId;
  }
}
