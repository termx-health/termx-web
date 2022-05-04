import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CodeSystem} from './code-system';
import {CodeSystemSearchParams} from './code-system-search-params';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {EntityProperty} from './entity-property';
import {CodeSystemVersion} from './code-system-version';

@Injectable()
export class CodeSystemLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/code-systems`;
  }

  public load(id: string): Observable<CodeSystem> {
    return this.http.get<CodeSystem>(`${this.baseUrl}/${id}`);
  }

  public loadProperties(id: string): Observable<EntityProperty[]> {
    return this.http.get<EntityProperty[]>(`${this.baseUrl}/${id}/properties`);
  }

  public loadVersions(id: string): Observable<CodeSystemVersion[]> {
    return this.http.get<CodeSystemVersion[]>(`${this.baseUrl}/${id}/versions`);
  }

  public search(params: CodeSystemSearchParams = {}): Observable<SearchResult<CodeSystem>> {
    return this.http.get<SearchResult<CodeSystem>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
