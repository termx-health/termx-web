import {ObservationDefinitionComponent} from 'term-web/observation-definition/_lib';

export class ObservationDefinitionProtocol {
  public id?: number;
  public device?: ObservationDefinitionProtocolValue;
  public method?: ObservationDefinitionProtocolValue;
  public measurementLocation?: ObservationDefinitionProtocolValue;
  public specimen?: ObservationDefinitionProtocolValue;
  public position?: ObservationDefinitionProtocolValue;
  public dataCollectionCircumstances?: ObservationDefinitionProtocolValue;
  public components?: ObservationDefinitionComponent[];
}

export class ObservationDefinitionProtocolValue {
  public usage?: string;
  public values?: string[];
  public valueSet?: string;
}
