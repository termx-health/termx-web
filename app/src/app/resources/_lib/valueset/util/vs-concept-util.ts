import {ConceptUtil, ValueSetVersionConcept} from 'term-web/resources/_lib';

export class VsConceptUtil {

  public static getDisplay(concept: ValueSetVersionConcept, lang: string): string {
    const d = concept?.additionalDesignations?.find(ad => ad?.language === lang)?.name;
    return d || ConceptUtil.getDisplay(concept.concept, lang);
  }
}
