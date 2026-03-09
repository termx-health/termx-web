import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {MeasurementUnit} from 'term-web/measurement-unit/_lib/model/measurement-unit';
import {MeasurementUnitSearchParams} from 'term-web/measurement-unit/_lib/model/measurement-unit-search-params';

@Injectable()
export class MeasurementUnitLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/ts/measurement-units`;

  public load(id: number): Observable<MeasurementUnit> {
    return this.http.get<MeasurementUnit>(`${this.baseUrl}/${id}`);
  }

  public loadKinds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/kinds`);
  }

  public search(params: MeasurementUnitSearchParams = {}): Observable<SearchResult<MeasurementUnit>> {
    return this.http.get<SearchResult<MeasurementUnit>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
