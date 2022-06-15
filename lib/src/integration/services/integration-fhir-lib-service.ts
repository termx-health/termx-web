import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CodeSystem} from '../../resources';
import {FhirCsLookupParams} from '../model/fhir-cs-lookup.params';
import {SearchHttpParams} from '@kodality-web/core-util';


@Injectable()
export class IntegrationFhirLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/fhir`;
  }

  public getCodeSystem(id: number): Observable<CodeSystem> {
    return this.http.get<CodeSystem>(`${this.baseUrl}/CodeSystem/${id}`);
  }

  public lookup(params: FhirCsLookupParams): Observable<FhirCsLookupParams> {
    return this.http.get<FhirCsLookupParams>(`${this.baseUrl}/CodeSystem/$lookup`, {params: SearchHttpParams.build(params)});
  }
}
