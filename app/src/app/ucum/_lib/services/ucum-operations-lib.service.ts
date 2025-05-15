import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from "rxjs";
import {AnalyseResponse} from "../model/analyse-response";
import {CanonicaliseResponse} from "../model/canonicalise-response";
import {ValidateResponse} from "../model/validate-response";
import {ConvertResponse} from "../model/convert-response";

@Injectable()
export class UcumOperationsLibService {
  protected baseUrl = `${environment.termxApi}/api/v1/ucum`;

  public constructor(protected http: HttpClient) {}

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
