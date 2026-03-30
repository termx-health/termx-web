import {DateRange} from '@termx-health/core-util';
import {LocalizedName} from '@termx-health/util';
import {MeasurementUnitMapping} from 'term-web/measurement-unit/_lib/model/measurement-unit-mapping';

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
