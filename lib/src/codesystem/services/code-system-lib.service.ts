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
    this.baseUrl = `${api}/ts/code-systems`;
  }

  public load(codeSystemId: string): Observable<CodeSystem> {
    return this.http.get<CodeSystem>(`${this.baseUrl}/${codeSystemId}`);
  }

  public loadProperties(codeSystemId: string): Observable<EntityProperty[]> {
    return this.http.get<EntityProperty[]>(`${this.baseUrl}/${codeSystemId}/properties`);
  }

  public loadVersion(codeSystemId: string, versionId: string): Observable<CodeSystemVersion> {
    return this.http.get<CodeSystemVersion>(`${this.baseUrl}/${codeSystemId}/versions/${versionId}`);
  }

  public loadVersions(codeSystemId: string): Observable<CodeSystemVersion[]> {
    return this.http.get<CodeSystemVersion[]>(`${this.baseUrl}/${codeSystemId}/versions`);
  }

  public search(params: CodeSystemSearchParams = {}): Observable<SearchResult<CodeSystem>> {
    return this.http.get<SearchResult<CodeSystem>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
