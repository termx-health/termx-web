import {ObservationDefinitionUnit} from './observation-definition-unit';

export class ObservationDefinitionValue {
  public id?: number;
  public behaviour?: string;
  public expression?: string;
  public type?: string;
  public unit?: ObservationDefinitionUnit;
  public multipleResultsAllowed?: boolean;

  public usage?: string;
  public values?: string[];
  public valueSet?: string;
}
