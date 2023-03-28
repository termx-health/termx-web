export class ObservationDefinitionInterpretation {
  public id?: number;
  public orderNumber?: number;
  public state?: ObservationDefinitionInterpretationState;
  public range?: ObservationDefinitionInterpretationRange;
  public condition?: string;
  public rangeCategory?: string;
  public fhirInterpretationCode?: string;
  public snomedInterpretationCode?: string;
}

export class ObservationDefinitionInterpretationState {
  public gender?: string;
  public age?: string;
  public gestationAge?: string;
}

export class ObservationDefinitionInterpretationRange {
  public numericRange?: number[];
  public conceptRange?: string[];
}
