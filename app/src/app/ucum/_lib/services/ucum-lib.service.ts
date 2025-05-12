import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {map, Observable} from 'rxjs';
import {Ucum} from '../model/ucum';
import {DefinedUnit, DefinedUnitSearchParams, UcumSearchParams} from 'term-web/ucum/_lib';
import {Prefix} from "../model/prefix";
import {BaseUnit} from "../model/base-unit";

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
      .get<{ data: DefinedUnit[] }>(`${this.baseUrl}/components/UNIT`)
      .pipe(
        map(res => res.data)
      );
  }

  public loadUnitByCode(code: string): Observable<DefinedUnit> {
    return this.http.get<DefinedUnit>(`${this.baseUrl}/units/${encodeURIComponent(code)}`);
  }

  public loadPrefixes(): Observable<Prefix[]> {
    return this.http
      .get<{ data: Prefix[] }>(`${this.baseUrl}/components/PREFIX`)
      .pipe(
        map(res => res.data)
      );
  }

  public loadPrefixByCode(code: string): Observable<Prefix> {
    return this.http.get<Prefix>(`${this.baseUrl}/prefixes/${encodeURIComponent(code)}`);
  }

  public loadBaseUnits(): Observable<BaseUnit[]> {
    return this.http
      .get<{ data: BaseUnit[] }>(`${this.baseUrl}/components/BASEUNIT`)
      .pipe(
        map(res => res.data)
      );
  }

  public loadBaseUnitByCode(code: string): Observable<BaseUnit> {
    return this.http.get<BaseUnit>(`${this.baseUrl}/base-units/${encodeURIComponent(code)}`);
  }

  public searchDefinedUnit(params: DefinedUnitSearchParams = {kind: 'UNIT', textContains: 'a'}): Observable<SearchResult<DefinedUnit>> {
    return this.http.get<SearchResult<DefinedUnit>>(`${this.baseUrl}/search`, {params: SearchHttpParams.build(params)});
  }

  public search(params: UcumSearchParams = {}): Observable<SearchResult<Ucum>> {
    return this.http.get<SearchResult<Ucum>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
