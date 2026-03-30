import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@termx-health/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {CodeSystemConcept, ConceptSearchParams} from 'term-web/resources/_lib/code-system';

@Injectable()
export class CodeSystemConceptLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/ts/concepts`;

  public load(id: number): Observable<CodeSystemConcept> {
    return this.http.get<CodeSystemConcept>(`${this.baseUrl}/${id}`);
  }

  public search(params: ConceptSearchParams = {}): Observable<SearchResult<CodeSystemConcept>> {
    return this.http.get<SearchResult<CodeSystemConcept>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
