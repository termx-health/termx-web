import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {ValueSet} from '../model/value-set';
import {ValueSetConcept, ValueSetVersion} from '../model/value-set-version';
import {ValueSetSearchParams} from '../model/value-set-search-params';
import {ValueSetVersionSearchParams} from '../model/value-set-version-search-params';
import {ValueSetExpandRequest} from '../model/value-set-expand-request';

@Injectable()
export class ValueSetLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/value-sets`;
  }

  public load(valueSetId: string): Observable<ValueSet> {
    return this.http.get<ValueSet>(`${this.baseUrl}/${valueSetId}`);
  }

  public search(params: ValueSetSearchParams = {}): Observable<SearchResult<ValueSet>> {
    return this.http.get<SearchResult<ValueSet>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public loadVersion(valueSetId: string, version: string): Observable<ValueSetVersion> {
    return this.http.get<ValueSetVersion>(`${this.baseUrl}/${valueSetId}/versions/${version}`);
  }

  public searchVersions(valueSetId: string, params: ValueSetVersionSearchParams = {}): Observable<SearchResult<ValueSetVersion>> {
    return this.http.get<SearchResult<ValueSetVersion>>(`${this.baseUrl}/${valueSetId}/versions`, {params: SearchHttpParams.build(params)});
  }

  public loadConcepts(valueSetId: string, versionVersion: string): Observable<ValueSetConcept[]> {
    return this.http.get<ValueSetConcept[]>(`${this.baseUrl}/${valueSetId}/versions/${versionVersion}/concepts`);
  }

  public expand(request: ValueSetExpandRequest): Observable<ValueSetConcept[]> {
    return this.http.post<ValueSetConcept[]>(`${this.baseUrl}/expand`, request);
  }
}
