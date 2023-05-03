import {LocalizedName} from '@kodality-web/marina-util';
import {ObservationDefinitionValue} from './observation-definition-value';
import {ObservationDefinitionMember} from './observation-definition-member';
import {ObservationDefinitionComponent} from './observation-definition-component';
import {ObservationDefinitionProtocol} from './observation-definition-protocol';
import {ObservationDefinitionInterpretation} from './observation-definition-interpretation';
import {ObservationDefinitionMapping} from './observation-definition-mapping';

export class ObservationDefinition {
  public id?: number;
  public code?: string;
  public version?: string;
  public publisher?: string;
  public url?: string;
  public status?: string;
  public names?: LocalizedName;
  public alias?: LocalizedName;
  public definition?: LocalizedName;
  public keywords?: ObservationDefinitionKeyWord[];
  public category?: ObservationDefinitionCategory[];
  public timePrecision?: string;
  public structure?: string[];
  public value?: ObservationDefinitionValue;
  public members?: ObservationDefinitionMember[];
  public components?: ObservationDefinitionComponent[];
  public protocol?: ObservationDefinitionProtocol;
  public state?: ObservationDefinitionComponent[];
  public interpretations?: ObservationDefinitionInterpretation[];
  public mappings?: ObservationDefinitionMapping[];
}


export class ObservationDefinitionKeyWord {
  public lang?: string;
  public word?: string;
}

export class ObservationDefinitionCategory {
  public code?: string;
  public codeSystem?: string;
}
