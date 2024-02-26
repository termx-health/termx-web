import {DateRange} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {MeasurementUnitMapping} from './measurement-unit-mapping';

export class MeasurementUnit {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;
  public alias?: LocalizedName;
  public period?: DateRange;
  public ordering?: number;
  public rounding?: number;
  public kind?: string;
  public definitionUnit?: string;
  public definitionValue?: string;

  public mappings?: MeasurementUnitMapping[];
}
