import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {CodeSystem} from './code-system';
import {CodeSystemSearchParams} from './code-system-search-params';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';

@Injectable({providedIn: 'root'})
export class CodeSystemService {
  private baseUrl = `${environment.api}/code-systems`;

  constructor(private http: HttpClient) {
  }

  public load(id: string): Observable<CodeSystem> {
    return this.http.get<CodeSystem>(`${this.baseUrl}/${id}`);
  }

  public search(params: CodeSystemSearchParams): Observable<SearchResult<CodeSystem>> {
    return this.http.get<SearchResult<CodeSystem>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public save(cs: CodeSystem): Observable<any> {
    return this.http.post(this.baseUrl, cs);
  }
}
