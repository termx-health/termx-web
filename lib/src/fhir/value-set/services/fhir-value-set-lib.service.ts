import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {FhirParameters} from '../../model/fhir-parameters';
import {Observable} from 'rxjs';
import {SearchHttpParams} from '@kodality-web/core-util';
import {FhirValueSetExpandParams} from '../model/fhir-value-set-expand.params';
import {FhirValueSetValidateCodeParams} from '../model/fhir-value-set-validate-code.params';

@Injectable()
export class FhirValueSetLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/fhir/ValueSet`;
  }

  public loadValueSet(id: string, version?: string, url?: string): Observable<any> {
    return this.http.get<any>(`${url ? url + '/fhir/CodeSystem' : this.baseUrl}/${id}`, {params: SearchHttpParams.build({version: version})});
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

  public import(urls: FhirParameters): Observable<FhirParameters> {
    return this.http.post<FhirParameters>(`${this.baseUrl}/$sync`, urls);
  }
}
