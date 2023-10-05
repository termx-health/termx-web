import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {HttpCacheService, SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {ValueSetVersionSearchParams} from '../model/value-set-version-search-params';
import {ValueSetVersion} from '../model/value-set-version';
import {ValueSetVersionConcept} from '../model/value-set-version-concept';
import {ValueSetExpandRequest} from '../model/value-set-expand-request';
import {ValueSet} from '../model/value-set';
import {ValueSetSearchParams} from '../model/value-set-search-params';
import {JobLogResponse, Provenance} from 'term-web/sys/_lib';

@Injectable()
export class ValueSetLibService {
  private cacheService: HttpCacheService;
  protected baseUrl = `${environment.termxApi}/ts/value-sets`;

  public constructor(protected http: HttpClient) {
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
