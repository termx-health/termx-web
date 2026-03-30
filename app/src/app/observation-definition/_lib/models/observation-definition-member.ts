import {CodeName} from '@termx-health/util';
import {ObservationDefinitionCardinality} from 'term-web/observation-definition/_lib/models/observation-definition-cardinality';

export class ObservationDefinitionMember {
  public id?: number;
  public item?: CodeName;
  public orderNumber?: number;
  public cardinality?: ObservationDefinitionCardinality;
}
