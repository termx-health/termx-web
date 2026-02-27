import {QueryParams} from '@kodality-web/core-util';

export class MapSetConceptSearchParams extends QueryParams {
  public type?: 'source' | 'target';
  public textContains?: string;
  public verified?: boolean;
  public unmapped?: boolean;
}
