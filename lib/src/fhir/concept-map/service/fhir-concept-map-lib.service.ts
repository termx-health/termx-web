import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {FhirParameters} from '../../model/fhir-parameters';
import {Observable} from 'rxjs';
import {FhirConceptMapTranslateParams} from '../model/fhir-concept-map-translate.params';
import {SearchHttpParams} from '@kodality-web/core-util';

@Injectable()
export class FhirConceptMapLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/fhir/ConceptMap`;
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
