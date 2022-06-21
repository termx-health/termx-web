import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {CodeSystem} from '../model/code-system';
import {CodeSystemVersion} from '../model/code-system-version';
import {CodeSystemSearchParams} from '../model/code-system-search-params';
import {CodeSystemConcept} from '../model/code-system-concept';
import {ConceptSearchParams} from '../model/concept-search-params';
import {EntityPropertySearchParams} from '../model/entity-property-search-params';
import {EntityProperty} from '../model/entity-property';
import {CodeSystemEntityVersionQueryParams} from '../model/code-system-entity-version-search-params';
import {CodeSystemEntityVersion} from '../model/code-system-entity';

@Injectable()
export class CodeSystemLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/code-systems`;
  }

  public load(codeSystemId: string): Observable<CodeSystem> {
    return this.http.get<CodeSystem>(`${this.baseUrl}/${codeSystemId}`);
  }

  public loadVersion(codeSystemId: string, version: string): Observable<CodeSystemVersion> {
    return this.http.get<CodeSystemVersion>(`${this.baseUrl}/${codeSystemId}/versions/${version}`);
  }

  public loadVersions(codeSystemId: string): Observable<CodeSystemVersion[]> {
    return this.http.get<CodeSystemVersion[]>(`${this.baseUrl}/${codeSystemId}/versions`);
  }

  public loadConcept(codeSystemId: string, conceptCode: string): Observable<CodeSystemConcept> {
    return this.http.get<CodeSystemConcept>(`${this.baseUrl}/${codeSystemId}/concepts/${conceptCode}`);
  }

  public search(params: CodeSystemSearchParams = {}): Observable<SearchResult<CodeSystem>> {
    return this.http.get<SearchResult<CodeSystem>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public searchConcepts(codeSystemId: string, params: ConceptSearchParams): Observable<SearchResult<CodeSystemConcept>> {
    return this.http.get<SearchResult<CodeSystemConcept>>(`${this.baseUrl}/${codeSystemId}/concepts`, {params: SearchHttpParams.build(params)});
  }

  public searchProperties(codeSystemId: string, params: EntityPropertySearchParams): Observable<SearchResult<EntityProperty>> {
    return this.http.get<SearchResult<EntityProperty>>(`${this.baseUrl}/${codeSystemId}/entity-properties`, {params: SearchHttpParams.build(params)});
  }

  public searchEntityVersions(codeSystemId: string, params: CodeSystemEntityVersionQueryParams = {}): Observable<SearchResult<CodeSystemEntityVersion>> {
    return this.http.get<SearchResult<CodeSystemEntityVersion>>(`${this.baseUrl}/${codeSystemId}/entity-versions`,  {params: SearchHttpParams.build(params)});
  }
}
