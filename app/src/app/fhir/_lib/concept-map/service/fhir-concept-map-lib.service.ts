import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {FhirParameters} from '../../model/fhir-parameters';
import {FhirConceptMapTranslateParams} from '../model/fhir-concept-map-translate.params';

@Injectable()
export class FhirConceptMapLibService {
  protected baseUrl = `${environment.termxApi}/fhir/ConceptMap`;

  public constructor(protected http: HttpClient) { }

  public loadConceptMap(id: string, version?: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}${version ? '.' + version : ''}`);
  }

  public import(urls: FhirParameters): Observable<FhirParameters> {
    return this.http.post<FhirParameters>(`${this.baseUrl}/$sync`, urls);
  }

  public translate(params: FhirConceptMapTranslateParams): Observable<FhirParameters> {
    return this.http.get<FhirParameters>(`${this.baseUrl}/$translate`, {params: SearchHttpParams.build(params)});
  }

  public closure(params: FhirParameters): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/$closure`, params);
  }
}
