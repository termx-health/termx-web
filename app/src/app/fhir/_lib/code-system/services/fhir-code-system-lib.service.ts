import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {FhirParameters} from '../../model/fhir-parameters';
import {FhirCodeSystemLookupParams} from '../model/fhir-code-system-lookup.params';
import {FhirCodeSystemValidateCodeParams} from '../model/fhir-code-system-validate-code.params';
import {FhirCodeSystemSubsumesParams} from '../model/fhir-code-system-subsumes.params';


@Injectable()
export class FhirCodeSystemLibService {
  protected baseUrl = `${environment.terminologyApi}/fhir/CodeSystem`;

  public constructor(protected http: HttpClient) { }

  public loadCodeSystem(id: string, version?: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}@${version}`);
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
