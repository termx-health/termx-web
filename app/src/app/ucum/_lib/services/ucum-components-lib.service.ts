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
export class UcumComponentsLibService {
  protected baseUrl = `${environment.termxApi}/api/v1/ucum`;

  public constructor(protected http: HttpClient) {}

  public load(id: number): Observable<Ucum> {
    return this.http.get<Ucum>(`${this.baseUrl}/${id}`);
  }

  public loadKinds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/kinds`);
  }

  public loadDefinedUnits(): Observable<DefinedUnit[]> {
    return this.http.get<DefinedUnit[]>(`${this.baseUrl}/defined-units`);
  }

  public loadUnitByCode(code: string): Observable<DefinedUnit> {
    return this.http.get<DefinedUnit>(`${this.baseUrl}/defined-units/${encodeURIComponent(code)}`);
  }

  public loadPrefixes(): Observable<Prefix[]> {
    return this.http.get<Prefix[]>(`${this.baseUrl}/prefixes`);
  }

  public loadPrefixByCode(code: string): Observable<Prefix> {
    return this.http.get<Prefix>(`${this.baseUrl}/prefixes/${encodeURIComponent(code)}`);
  }

  public loadBaseUnits(): Observable<BaseUnit[]> {
    return this.http.get<BaseUnit[]>(`${this.baseUrl}/base-units`);
  }

  public loadBaseUnitByCode(code: string): Observable<BaseUnit> {
    return this.http.get<BaseUnit>(`${this.baseUrl}/base-units/${encodeURIComponent(code)}`);
  }
}
