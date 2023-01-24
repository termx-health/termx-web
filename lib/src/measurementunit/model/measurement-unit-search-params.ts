import {QueryParams} from '@kodality-web/core-util';

export class MeasurementUnitSearchParams extends QueryParams {
  public code?: string;
  public textContains?: string;
}
