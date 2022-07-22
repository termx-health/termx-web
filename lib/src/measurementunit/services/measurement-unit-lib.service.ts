import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MeasurementUnit} from '../model/measurement-unit';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {MeasurementUnitSearchParams} from '../model/measurement-unit-search-params';

@Injectable()
export class MeasurementUnitLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/measurement-units`;
  }

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
