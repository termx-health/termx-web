import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@termx-health/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {ObservationDefinition} from 'term-web/observation-definition/_lib/models/observation-definition';
import {ObservationDefinitionSearchParams} from 'term-web/observation-definition/_lib/models/observation-definition-search-params';



@Injectable()
export class ObservationDefinitionLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/observation-definitions`;

  public search(params: ObservationDefinitionSearchParams): Observable<SearchResult<ObservationDefinition>> {
    return this.http.get<SearchResult<ObservationDefinition>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public load(id: number): Observable<ObservationDefinition> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}
