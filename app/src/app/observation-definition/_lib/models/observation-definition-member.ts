import {ObservationDefinitionCardinality} from './observation-definition-cardinality';
import {CodeName} from '@kodality-web/marina-util';

export class ObservationDefinitionMember {
  public id?: number;
  public item?: CodeName;
  public orderNumber?: number;
  public cardinality?: ObservationDefinitionCardinality;
}
