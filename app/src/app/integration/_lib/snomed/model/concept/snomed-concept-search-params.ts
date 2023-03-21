import {QueryParams} from '@kodality-web/core-util';

export class SnomedConceptSearchParams extends QueryParams {
  public conceptIds?: string[];
  public term?: string;
  public termActive?: Boolean;
  public language?: string;
  public ecl?: string;
}
