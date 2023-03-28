import {LocalizedName} from '@kodality-web/marina-util';
import {ObservationDefinitionCardinality} from './observation-definition-cardinality';
import {ObservationDefinitionUnit} from './observation-definition-unit';

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
