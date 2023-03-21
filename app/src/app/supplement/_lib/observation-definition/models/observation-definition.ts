import {LocalizedName} from '@kodality-web/marina-util';

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
  public category?: string;
  public timePrecision?: string;
}


export class ObservationDefinitionKeyWord {
  public lang?: string;
  public word?: string;
}
