import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {FhirParameters, SEPARATOR} from '../../model/fhir-parameters';
import {FhirValueSetExpandParams} from '../model/fhir-value-set-expand.params';
import {FhirValueSetValidateCodeParams} from '../model/fhir-value-set-validate-code.params';

@Injectable()
export class FhirValueSetLibService {
  protected baseUrl = `${environment.termxApi}/fhir/ValueSet`;

  public constructor(protected http: HttpClient) {  }

  public loadValueSet(id: string, version?: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}${version ? SEPARATOR + version : ''}`);
  }

  public search(params: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public expandValueSet(id: string, params?: FhirValueSetExpandParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/$expand`, {params: SearchHttpParams.build(params)});
  }

  public expand(params: FhirValueSetExpandParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/$expand`, {params: SearchHttpParams.build(params)});
  }

  public validateCode(params: FhirValueSetValidateCodeParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/$validate-code`, {params: SearchHttpParams.build(params)});
  }

  public import(params: FhirParameters): Observable<FhirParameters> {
    return this.http.post<FhirParameters>(`${this.baseUrl}/$sync`, {...params, resourceType: 'Parameters'});
  }
}
