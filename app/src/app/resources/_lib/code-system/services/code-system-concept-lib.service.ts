import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {CodeSystemConcept, ConceptSearchParams} from '../../code-system';

@Injectable()
export class CodeSystemConceptLibService {
  protected baseUrl = `${environment.termxApi}/ts/concepts`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<CodeSystemConcept> {
    return this.http.get<CodeSystemConcept>(`${this.baseUrl}/${id}`);
  }

  public search(params: ConceptSearchParams = {}): Observable<SearchResult<CodeSystemConcept>> {
    return this.http.get<SearchResult<CodeSystemConcept>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
