import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {CodeSystem} from '../model/code-system';
import {EntityProperty} from '../model/entity-property';
import {CodeSystemVersion} from '../model/code-system-version';
import {CodeSystemSearchParams} from '../model/code-system-search-params';
import {CodeSystemConcept} from '../model/code-system-concept';
import {ConceptSearchParams} from '../model/concept-search-params';

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

  public searchConcepts(codeSystemId:string, params: ConceptSearchParams = {}): Observable<SearchResult<CodeSystemConcept>> {
    return this.http.get<SearchResult<CodeSystemConcept>>(`${this.baseUrl}/${codeSystemId}/concepts`, {params: SearchHttpParams.build(params)});
  }
}
