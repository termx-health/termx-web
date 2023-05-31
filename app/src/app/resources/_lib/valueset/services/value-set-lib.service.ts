import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {HttpCacheService, SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {ValueSetVersionSearchParams} from '../model/value-set-version-search-params';
import {ValueSetVersion} from '../model/value-set-version';
import {ValueSetVersionConcept} from '../model/value-set-version-concept';
import {ValueSetExpandRequest} from '../model/value-set-expand-request';
import {ValueSetVersionRule} from '../model/value-set-version-rule';
import {ValueSet} from '../model/value-set';
import {ValueSetSearchParams} from '../model/value-set-search-params';
import {ValueSetVersionRuleSearchParams, ValueSetVersionRuleSet} from 'term-web/resources/_lib';

@Injectable()
export class ValueSetLibService {
  private cacheService: HttpCacheService;
  protected baseUrl = `${environment.terminologyApi}/ts/value-sets`;

  public constructor(protected http: HttpClient) {
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
    if (!request.ruleSet) {
      const key = `${request.valueSet}#${request.valueSetVersion || '-'}`;
      return this.cacheService.put(key, this.http.post<ValueSetVersionConcept[]>(`${this.baseUrl}/expand`, request));
    }
    return this.http.post<ValueSetVersionConcept[]>(`${this.baseUrl}/expand`, request);
  }

  public loadRule(valueSetId: string, id: number): Observable<ValueSetVersionRule> {
    return this.http.get<ValueSetVersionRule>(`${this.baseUrl}/${valueSetId}/rules/${id}`);
  }

  public searchRules(valueSetId: string, params: ValueSetVersionRuleSearchParams = {}): Observable<SearchResult<ValueSetVersion>> {
    return this.http.get<SearchResult<ValueSetVersionRule>>(`${this.baseUrl}/${valueSetId}/rules`, {params: SearchHttpParams.build(params)});
  }

  public loadRuleSet(valueSetId: string): Observable<ValueSetVersionRuleSet> {
    return this.http.get<ValueSetVersionRuleSet>(`${this.baseUrl}/${valueSetId}/rule-set`);
  }
}
