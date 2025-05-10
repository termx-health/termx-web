import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {map, Observable} from 'rxjs';
import {Ucum} from '../model/ucum';
import {DefinedUnit, DefinedUnitSearchParams, UcumSearchParams} from 'term-web/ucum/_lib';

@Injectable()
export class UcumLibService {
  protected baseUrl = `${environment.termxApi}/ucum`;

  public constructor(protected http: HttpClient) {}

  public load(id: number): Observable<Ucum> {
    return this.http.get<Ucum>(`${this.baseUrl}/${id}`);
  }

  public loadKinds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/kinds`);
  }

  public loadDefinedUnits(): Observable<DefinedUnit[]> {
    return this.http
      .get<{ result: DefinedUnit[] }>(`${this.baseUrl}/defined-units`)
      .pipe(
        map(res => res.result)
      );
  }

  public searchDefinedUnit(params: DefinedUnitSearchParams = {kind: 'UNIT', textContains: 'a'}): Observable<SearchResult<DefinedUnit>> {
    return this.http.get<SearchResult<DefinedUnit>>(`${this.baseUrl}/search`, {params: SearchHttpParams.build(params)});
  }

  public search(params: UcumSearchParams = {}): Observable<SearchResult<Ucum>> {
    return this.http.get<SearchResult<Ucum>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
