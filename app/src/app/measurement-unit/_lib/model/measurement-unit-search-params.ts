import {QueryParams} from '@termx-health/core-util';

export class MeasurementUnitSearchParams extends QueryParams {
  public code?: string;
  public textContains?: string;
}
