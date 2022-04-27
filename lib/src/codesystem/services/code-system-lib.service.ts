import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CodeSystem} from './code-system';
import {CodeSystemSearchParams} from './code-system-search-params';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';

@Injectable()
export class CodeSystemLibService {
  // fixme: environment provider or some config
  protected baseUrl = `http://65.108.244.113:8200/code-systems`;

  constructor(protected http: HttpClient) { }

  public load(id: string): Observable<CodeSystem> {
    return this.http.get<CodeSystem>(`${this.baseUrl}/${id}`);
  }

  public search(params: CodeSystemSearchParams): Observable<SearchResult<CodeSystem>> {
    return this.http.get<SearchResult<CodeSystem>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
