import {ObservationDefinitionUnit} from './observation-definition-unit';

export class ObservationDefinitionValue {
  public id?: number;
  public behaviour?: string;
  public expression?: string;
  public type?: string;
  public unit?: ObservationDefinitionUnit;
  public valueSet?: string;
  public multipleResultsAllowed?: boolean;
}
