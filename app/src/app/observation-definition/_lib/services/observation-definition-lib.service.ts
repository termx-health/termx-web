import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {ObservationDefinition} from '../models/observation-definition';
import {ObservationDefinitionSearchParams} from '../models/observation-definition-search-params';


const MOCK: ObservationDefinition[] = [
  {
    id: 42,
    code: 'TEST',
    names: {
      en: "Test EN",
      et: "Test ET"
    }
  }
];


@Injectable()
export class ObservationDefinitionLibService {
  protected baseUrl = `${environment.termxApi}/observation-definitions`;

  public constructor(protected http: HttpClient) { }

  public search(params: ObservationDefinitionSearchParams): Observable<SearchResult<ObservationDefinition>> {
    return this.http.get<SearchResult<ObservationDefinition>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public load(id: number): Observable<ObservationDefinition> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}
