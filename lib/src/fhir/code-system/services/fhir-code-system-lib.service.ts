import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FhirCodeSystemLookupParams} from '../model/fhir-code-system-lookup.params';
import {SearchHttpParams} from '@kodality-web/core-util';
import {FhirSyncParameters} from '../../model/fhir-sync-parameters';
import {FhirCodeSystemValidateCodeParams} from '../model/fhir-code-system-validate-code.params';


@Injectable()
export class FhirCodeSystemLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/fhir/CodeSystem`;
  }

  public loadCodeSystem(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  public import(urls: FhirSyncParameters): Observable<FhirSyncParameters> {
    return this.http.post<FhirSyncParameters>(`${this.baseUrl}/$sync`, urls);
  }

  public lookup(params: FhirCodeSystemLookupParams): Observable<FhirCodeSystemLookupParams> {
    return this.http.get<FhirCodeSystemLookupParams>(`${this.baseUrl}/$lookup`, {params: SearchHttpParams.build(params)});
  }
  public validateCode(params: FhirCodeSystemValidateCodeParams): Observable<FhirCodeSystemValidateCodeParams> {
    return this.http.get<FhirCodeSystemValidateCodeParams>(`${this.baseUrl}/$validate-code`, {params: SearchHttpParams.build(params)});
  }
}
