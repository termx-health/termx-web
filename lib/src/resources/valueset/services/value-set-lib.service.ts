import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {HttpCacheService, SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {ValueSet} from '../model/value-set';
import {ValueSetVersion} from '../model/value-set-version';
import {ValueSetSearchParams} from '../model/value-set-search-params';
import {ValueSetVersionSearchParams} from '../model/value-set-version-search-params';
import {ValueSetExpandRequest} from '../model/value-set-expand-request';
import {ValueSetVersionConcept} from '../model/value-set-version-concept';
import {ValueSetVersionRule} from '../model/value-set-version-rule';

@Injectable()
export class ValueSetLibService {
  protected baseUrl;
  private cacheService: HttpCacheService;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/value-sets`;
    this.cacheService = new HttpCacheService();
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

  public loadConcept(valueSetId: string, valueSetVersion: string, id: number): Observable<ValueSetVersionConcept> {
    return this.http.get<ValueSetVersionConcept>(`${this.baseUrl}/${valueSetId}/versions/${valueSetVersion}/concepts/${id}`);
  }

  public expand(request: ValueSetExpandRequest): Observable<ValueSetVersionConcept[]> {
    if (request.valueSet) {
      const key = `${request.valueSet}#${request.valueSetVersion || '-'}`;
      return this.cacheService.getCachedResponse(key, this.http.post<ValueSetVersionConcept[]>(`${this.baseUrl}/expand`, request));
    }
    return this.http.post<ValueSetVersionConcept[]>(`${this.baseUrl}/expand`, request);
  }

  public loadRule(valueSetId: string, id: number): Observable<ValueSetVersionRule> {
    return this.http.get<ValueSetVersionRule>(`${this.baseUrl}/${valueSetId}/rules/${id}`);
  }
}
