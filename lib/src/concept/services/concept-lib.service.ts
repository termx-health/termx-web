import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {Concept} from './concept';
import {ConceptSearchParams} from './concept-search-params';

@Injectable()
export class ConceptLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/concepts`;
  }

  public load(id: number): Observable<Concept> {
    return this.http.get<Concept>(`${this.baseUrl}/${id}`);
  }

  public search(params: ConceptSearchParams = {}): Observable<SearchResult<Concept>> {
    return this.http.get<SearchResult<Concept>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
