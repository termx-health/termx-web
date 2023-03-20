import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API_URL} from '../../../terminology-lib.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {CodeSystemConcept} from '../model/code-system-concept';
import {ConceptSearchParams} from '../model/concept-search-params';

@Injectable()
export class CodeSystemConceptLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API_URL) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/concepts`;
  }

  public load(id: number): Observable<CodeSystemConcept> {
    return this.http.get<CodeSystemConcept>(`${this.baseUrl}/${id}`);
  }

  public search(params: ConceptSearchParams = {}): Observable<SearchResult<CodeSystemConcept>> {
    return this.http.get<SearchResult<CodeSystemConcept>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
