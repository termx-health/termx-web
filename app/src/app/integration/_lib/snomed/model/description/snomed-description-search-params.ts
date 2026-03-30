import {QueryParams} from '@termx-health/core-util';

export class SnomedDescriptionSearchParams extends QueryParams {
  public conceptId?: string;
  public conceptIds?: string;
}
