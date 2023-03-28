import {ObservationDefinitionCardinality} from './observation-definition-cardinality';
import {LocalizedName} from '@kodality-web/marina-util';

export class ObservationDefinitionMember {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;
  public orderNumber?: number;
  public cardinality?: ObservationDefinitionCardinality;
}
