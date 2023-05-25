import {QueryParams} from '@kodality-web/core-util';

export class ObservationDefinitionSearchParams extends QueryParams {
  public codes?: string;
  public idsNe?: string;
  public textContains?: string;
  public categories?: string;
  public structures?: string;
  public types?: string;

  public decorated?: boolean;
  public decoratedValue?: boolean;
}
