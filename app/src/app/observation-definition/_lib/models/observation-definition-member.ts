import {CodeName} from '@kodality-web/marina-util';
import {ObservationDefinitionCardinality} from './observation-definition-cardinality';

export class ObservationDefinitionMember {
  public id?: number;
  public item?: CodeName;
  public orderNumber?: number;
  public cardinality?: ObservationDefinitionCardinality;
}
