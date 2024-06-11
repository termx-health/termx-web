import {compareValues} from '@kodality-web/core-util';
import {CodeSystemConcept, CodeSystemEntityVersion} from 'term-web/resources/_lib';

export class ConceptUtil {

  public static getLastVersion(concept: CodeSystemConcept): CodeSystemEntityVersion {
    return concept?.versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }

  public static getDisplay(concept: CodeSystemConcept, lang: string): string {
    const version = this.getLastVersion(concept);
    const displays = version?.designations?.filter(d => d.designationType === 'display').sort((d1, d2) => d1.language === lang ? 0 : 1);
    return displays?.length > 0 ? displays[0]?.name : concept.code;
  }

  public static getPropertyValue(concept: CodeSystemConcept, property: string): any {
    const version = this.getLastVersion(concept);
    return version?.propertyValues?.find(pv => pv.entityProperty === property)?.value;
  }
}
