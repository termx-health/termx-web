import {SnomedConcept} from '../concept/snomed-concept';

export class SnomedRelationship {
  public id?: string;
  public effectiveTime?: string;
  public active?: boolean;
  public moduleId?: string;

  public destinationId?: string;
  public sourceId?: string;
  public groupId?: number;
  public relationshipId?: string;
  public type?: SnomedConcept;
  public target?: SnomedConcept;
  public isLeafInferred?: boolean;
}
