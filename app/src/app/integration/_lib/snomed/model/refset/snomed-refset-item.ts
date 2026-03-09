import {SnomedConcept} from 'term-web/integration/_lib/snomed/model/concept/snomed-concept';

export class SnomedRefsetItem {
  public active?: boolean;
  public moduleId?: string;
  public refsetId?: string;
  public referencedComponentId?: string;
  public referencedComponent?: SnomedConcept;
  public additionalFields?: {mapTarget: string};
}
