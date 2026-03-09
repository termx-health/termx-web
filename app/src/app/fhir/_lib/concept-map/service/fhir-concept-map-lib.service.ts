import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {FhirParameters, SEPARATOR} from 'term-web/fhir/_lib/model/fhir-parameters';
import {FhirConceptMapTranslateParams} from 'term-web/fhir/_lib/concept-map/model/fhir-concept-map-translate.params';

@Injectable()
export class FhirConceptMapLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/fhir/ConceptMap`;

  public loadConceptMap(id: string, version?: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}${version ? SEPARATOR + version : ''}`);
  }

  public import(params: FhirParameters): Observable<FhirParameters> {
    return this.http.post<FhirParameters>(`${this.baseUrl}/$sync`, {...params, resourceType: 'Parameters'});
  }

  public translate(params: FhirConceptMapTranslateParams): Observable<FhirParameters> {
    return this.http.get<FhirParameters>(`${this.baseUrl}/$translate`, {params: SearchHttpParams.build(params)});
  }

  public closure(params: FhirParameters): Observable<any> {
    return this.http.post<FhirParameters>(`${this.baseUrl}/$closure`, {...params, resourceType: 'Parameters'});
  }
}
