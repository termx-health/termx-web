import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {HttpCacheService, SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {JobLogResponse, Provenance} from 'term-web/sys/_lib';
import {ValueSet} from 'term-web/resources/_lib/value-set/model/value-set';
import {ValueSetExpandRequest} from 'term-web/resources/_lib/value-set/model/value-set-expand-request';
import {ValueSetSearchParams} from 'term-web/resources/_lib/value-set/model/value-set-search-params';
import {ValueSetVersion} from 'term-web/resources/_lib/value-set/model/value-set-version';
import {ValueSetVersionConcept} from 'term-web/resources/_lib/value-set/model/value-set-version-concept';
import {ValueSetVersionSearchParams} from 'term-web/resources/_lib/value-set/model/value-set-version-search-params';

@Injectable()
export class ValueSetLibService {
  protected http = inject(HttpClient);

  private cacheService: HttpCacheService;
  protected baseUrl = `${environment.termxApi}/ts/value-sets`;

  public constructor() {
    this.cacheService = new HttpCacheService();
  }

  public search(params: ValueSetSearchParams = {}): Observable<SearchResult<ValueSet>> {
    return this.http.get<SearchResult<ValueSet>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public load(valueSetId: string, decorate?: boolean): Observable<ValueSet> {
    return this.http.get<ValueSet>(`${this.baseUrl}/${valueSetId}?decorate=${decorate}`);
  }

  public searchVersions(valueSetId: string, params: ValueSetVersionSearchParams = {}): Observable<SearchResult<ValueSetVersion>> {
    return this.http.get<SearchResult<ValueSetVersion>>(`${this.baseUrl}/${valueSetId}/versions`, {params: SearchHttpParams.build(params)});
  }

  public loadVersion(valueSetId: string, version: string): Observable<ValueSetVersion> {
    return this.http.get<ValueSetVersion>(`${this.baseUrl}/${valueSetId}/versions/${version}`);
  }

  public expand(request: ValueSetExpandRequest): Observable<ValueSetVersionConcept[]> {
    const key = `${request.valueSet}#${request.valueSetVersion || '-'}`;
    return this.cacheService.put(key, this.http.post<ValueSetVersionConcept[]>(`${this.baseUrl}/expand`, request));
  }

  public expandAsync(request: ValueSetExpandRequest): Observable<JobLogResponse> {
    return this.http.post<JobLogResponse>(`${this.baseUrl}/expand-async`, request);
  }

  public loadProvenances(valueSet: string, version: string): Observable<Provenance[]> {
    return this.http.get<Provenance[]>(`${this.baseUrl}/${valueSet}/provenances`, {params: SearchHttpParams.build({version})});
  }
}
