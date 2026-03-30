import {LocalizedName} from '@termx-health/util';
import {ObservationDefinitionComponent} from 'term-web/observation-definition/_lib/models/observation-definition-component';
import {ObservationDefinitionInterpretation} from 'term-web/observation-definition/_lib/models/observation-definition-interpretation';
import {ObservationDefinitionMapping} from 'term-web/observation-definition/_lib/models/observation-definition-mapping';
import {ObservationDefinitionMember} from 'term-web/observation-definition/_lib/models/observation-definition-member';
import {ObservationDefinitionProtocol} from 'term-web/observation-definition/_lib/models/observation-definition-protocol';
import {ObservationDefinitionValue} from 'term-web/observation-definition/_lib/models/observation-definition-value';

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
