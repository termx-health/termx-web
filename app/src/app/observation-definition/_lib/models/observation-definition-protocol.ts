export class ObservationDefinitionProtocol {
  public id?: number;
  public device?: ObservationDefinitionProtocolValue;
  public method?: ObservationDefinitionProtocolValue;
  public measurementLocation?: ObservationDefinitionProtocolValue;
  public specimen?: ObservationDefinitionProtocolValue;
  public position?: ObservationDefinitionProtocolValue;
  public dataCollectionCircumstances?: any;
}

export class ObservationDefinitionProtocolValue {
  public values?: string[];
  public valueSet?: string;
}
