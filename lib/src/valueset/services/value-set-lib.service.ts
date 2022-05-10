import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {ValueSetSearchParams} from './value-set-search-params';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {ValueSet} from './value-set';
import {ValueSetVersion} from './value-set-version';
import {CodeSystemVersion} from '../../codesystem/services/code-system-version';
import {Concept} from '../../codesystem/services/concept';

@Injectable()
export class ValueSetLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/value-sets`;
  }
  public loadValueSet(valueSetId: string): Observable<ValueSet>{
    return this.http.get<ValueSet>(`${this.baseUrl}/${valueSetId}`);
  }

  public loadVersion(valueSetId: string, versionId: string): Observable<CodeSystemVersion> {
    return this.http.get<CodeSystemVersion>(`${this.baseUrl}/${valueSetId}/versions/${versionId}`);
  }

  public loadVersions(valueSetId: string): Observable<ValueSetVersion[]> {
    return this.http.get<ValueSetVersion[]>(`${this.baseUrl}/${valueSetId}/versions`);
  }
  public loadConcepts(valueSetId: string, versionVersion: string): Observable<Concept[]> {
    return this.http.get<Concept[]>(`${this.baseUrl}/${valueSetId}/versions/${versionVersion}/concepts`);
  }

  public search(params: ValueSetSearchParams = {}): Observable<SearchResult<ValueSet>>{
    return this.http.get<SearchResult<ValueSet>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
