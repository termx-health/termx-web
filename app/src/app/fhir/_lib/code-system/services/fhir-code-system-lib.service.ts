import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {FhirParameters, SEPARATOR} from 'term-web/fhir/_lib/model/fhir-parameters';
import {FhirCodeSystemLookupParams} from 'term-web/fhir/_lib/code-system/model/fhir-code-system-lookup.params';
import {FhirCodeSystemSubsumesParams} from 'term-web/fhir/_lib/code-system/model/fhir-code-system-subsumes.params';
import {FhirCodeSystemValidateCodeParams} from 'term-web/fhir/_lib/code-system/model/fhir-code-system-validate-code.params';


@Injectable()
export class FhirCodeSystemLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/fhir/CodeSystem`;

  public loadCodeSystem(id: string, version?: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}${version ? SEPARATOR + version : ''}`);
  }

  public import(params: FhirParameters): Observable<FhirParameters> {
    return this.http.post<FhirParameters>(`${this.baseUrl}/$sync`, {...params, resourceType: 'Parameters'});
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
    return this.http.post<FhirParameters>(`${this.baseUrl}/$find-matches`, {...params, resourceType: 'Parameters'});
  }
}
