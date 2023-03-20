import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API_URL} from '../../../terminology-lib.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FhirCodeSystemLookupParams} from '../model/fhir-code-system-lookup.params';
import {SearchHttpParams} from '@kodality-web/core-util';
import {FhirParameters} from '../../model/fhir-parameters';
import {FhirCodeSystemValidateCodeParams} from '../model/fhir-code-system-validate-code.params';
import {FhirCodeSystemSubsumesParams} from '../model/fhir-code-system-subsumes.params';


@Injectable()
export class FhirCodeSystemLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API_URL) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/fhir/CodeSystem`;
  }

  public loadCodeSystem(id: string, version?: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, {params: SearchHttpParams.build({version: version})});
  }

  public import(urls: FhirParameters): Observable<FhirParameters> {
    return this.http.post<FhirParameters>(`${this.baseUrl}/$sync`, urls);
  }

  public lookup(params: FhirCodeSystemLookupParams): Observable<FhirParameters> {
    return this.http.get<FhirParameters>(`${this.baseUrl}/$lookup`, {params: SearchHttpParams.build(params)});
  }

  public validateCode(params: FhirCodeSystemValidateCodeParams): Observable<FhirParameters> {
    return this.http.get<FhirParameters>(`${this.baseUrl}/$validate-code`, {params: SearchHttpParams.build(params)});
  }

  public subsumes(params: FhirCodeSystemSubsumesParams): Observable<FhirParameters> {
    return this.http.get<FhirParameters>(`${this.baseUrl}/$subsumes`, {params: SearchHttpParams.build(params)});
  }

  public findMatches(params: FhirParameters): Observable<FhirParameters> {
    return this.http.post<FhirParameters>(`${this.baseUrl}/$find-matches`, params);
  }
}
