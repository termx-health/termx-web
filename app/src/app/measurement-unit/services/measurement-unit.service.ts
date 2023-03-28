import {Injectable} from '@angular/core';
import {MeasurementUnit, MeasurementUnitLibService} from 'term-web/measurement-unit/_lib';
import {Observable} from 'rxjs';
import {isDefined} from '@kodality-web/core-util';

@Injectable()
export class MeasurementUnitService extends MeasurementUnitLibService {
  public save(mu: MeasurementUnit): Observable<MeasurementUnit> {
    if (isDefined(mu.id)) {
      return this.http.put(`${this.baseUrl}/${mu.id}`, mu);
    }
    return this.http.post(this.baseUrl, mu);
  }
}
