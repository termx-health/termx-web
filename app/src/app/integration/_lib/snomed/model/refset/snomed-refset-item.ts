import {SnomedConcept} from '../concept/snomed-concept';

export class SnomedRefsetItem {
  public active?: boolean;
  public moduleId?: string;
  public refsetId?: string;
  public referencedComponentId?: string;
  public referencedComponent?: SnomedConcept;
  public additionalFields?: {mapTarget: string};
}
