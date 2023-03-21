import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {CodeSystemConcept, ConceptSearchParams} from '../../codesystem';
import {environment} from 'environments/environment';

@Injectable()
export class CodeSystemConceptLibService {
  protected baseUrl = `${environment.terminologyApi}/ts/concepts`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<CodeSystemConcept> {
    return this.http.get<CodeSystemConcept>(`${this.baseUrl}/${id}`);
  }

  public search(params: ConceptSearchParams = {}): Observable<SearchResult<CodeSystemConcept>> {
    return this.http.get<SearchResult<CodeSystemConcept>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
