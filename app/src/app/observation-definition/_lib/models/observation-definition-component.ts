import {LocalizedName} from '@termx-health/util';
import {ObservationDefinitionCardinality} from 'term-web/observation-definition/_lib/models/observation-definition-cardinality';
import {ObservationDefinitionUnit} from 'term-web/observation-definition/_lib/models/observation-definition-unit';

export class ObservationDefinitionComponent {
  public id?: number;
  public sectionType?: string;
  public code?: string;
  public names?: LocalizedName;
  public orderNumber?: number;
  public cardinality?: ObservationDefinitionCardinality;
  public type?: string;
  public unit?: ObservationDefinitionUnit;
  public valueSet?: string;
}
