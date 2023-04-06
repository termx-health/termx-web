export class ObservationDefinitionInterpretation {
  public id?: number;
  public target?: ObservationDefinitionInterpretationTarget;
  public orderNumber?: number;
  public state?: ObservationDefinitionInterpretationState;
  public range?: ObservationDefinitionInterpretationRange;
  public condition?: string;
  public rangeCategory?: string;
  public fhirInterpretationCode?: string;
  public snomedInterpretationCode?: string;
}

export class ObservationDefinitionInterpretationTarget {
  public type?: string;
  public id?: number;
}

export class ObservationDefinitionInterpretationState {
  public gender?: string;
  public age?: {min?: number, max?: number};
  public gestationAge?:  {min?: number, max?: number};
}

export class ObservationDefinitionInterpretationRange {
  public numericRange?: {min?: number, max?: number};
  public valueSet?: string;
  public codeSystem?: string;
  public codeSystemConcepts?: string[];
}
