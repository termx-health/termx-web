import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {DefinedUnit} from 'term-web/ucum/_lib';
import {Prefix} from "../model/prefix";
import {BaseUnit} from "../model/base-unit";
import {AnalyseResponse} from "term-web/ucum/_lib/model/analyse-response";
import {CanonicaliseResponse} from "term-web/ucum/_lib/model/canonicalise-response";
import {ValidateResponse} from "term-web/ucum/_lib/model/validate-response";
import {ConvertResponse} from "term-web/ucum/_lib/model/convert-response";

@Injectable()
export class UcumLibService {
  protected baseUrl = `${environment.termxApi}/api/v1/ucum`;

  public constructor(protected http: HttpClient) {}

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

  public analyse(code: string): Observable<AnalyseResponse> {
    return this.http.get<AnalyseResponse>(`${this.baseUrl}/analyse?code=${encodeURIComponent(code)}`);
  }

  public canonicalise(code: string): Observable<CanonicaliseResponse> {
    return this.http.get<CanonicaliseResponse>(`${this.baseUrl}/canonicalise?code=${encodeURIComponent(code)}`);
  }

  public validate(code: string): Observable<ValidateResponse> {
    return this.http.get<ValidateResponse>(`${this.baseUrl}/validate?code=${encodeURIComponent(code)}`);
  }

  public convert(value: number, sourceCode: string, targetCode: string): Observable<ConvertResponse> {
    return this.http.get<ConvertResponse>(`${this.baseUrl}/convert?value=${encodeURIComponent(value)}&sourceCode=${encodeURIComponent(sourceCode)}&targetCode=${encodeURIComponent(targetCode)}`);
  }
}
