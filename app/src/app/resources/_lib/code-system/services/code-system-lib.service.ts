import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';

import {environment} from 'environments/environment';
import {CodeSystemVersion} from '../model/code-system-version';
import {EntityProperty} from '../model/entity-property';
import {CodeSystemSearchParams} from '../model/code-system-search-params';
import {CodeSystem} from '../model/code-system';
import {CodeSystemVersionSearchParams} from '../model/code-system-version-search-params';
import {ConceptSearchParams} from '../model/concept-search-params';
import {CodeSystemConcept} from '../model/code-system-concept';
import {EntityPropertySearchParams} from '../model/entity-property-search-params';
import {CodeSystemEntityVersionSearchParams} from '../model/code-system-entity-version-search-params';
import {CodeSystemEntityVersion} from '../model/code-system-entity';
import {CodeSystemAssociation} from 'term-web/resources/_lib';
import {Provenance} from 'term-web/sys/_lib';

@Injectable()
export class CodeSystemLibService {
  protected baseUrl = `${environment.termxApi}/ts/code-systems`;

  public constructor(protected http: HttpClient) { }

  public search(params: CodeSystemSearchParams = {}): Observable<SearchResult<CodeSystem>> {
    return this.http.get<SearchResult<CodeSystem>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public load(codeSystemId: string, decorate?: boolean): Observable<CodeSystem> {
    return this.http.get<CodeSystem>(`${this.baseUrl}/${codeSystemId}` + (decorate ? `?decorate=${decorate}` : ``));
  }

  public searchVersions(codeSystemId: string, params: CodeSystemVersionSearchParams = {}): Observable<SearchResult<CodeSystemVersion>> {
    return this.http.get<SearchResult<CodeSystemVersion>>(`${this.baseUrl}/${codeSystemId}/versions`, {params: SearchHttpParams.build(params)});
  }

  public loadVersion(codeSystemId: string, version: string): Observable<CodeSystemVersion> {
    return this.http.get<CodeSystemVersion>(`${this.baseUrl}/${codeSystemId}/versions/${version}`);
  }

  public searchConcepts(codeSystemId: string, params: ConceptSearchParams): Observable<SearchResult<CodeSystemConcept>> {
    return this.http.get<SearchResult<CodeSystemConcept>>(`${this.baseUrl}/${codeSystemId}/concepts`, {params: SearchHttpParams.build(params)});
  }

  public loadConcept(codeSystemId: string, conceptCode: string, version?: string): Observable<CodeSystemConcept> {
    conceptCode = encodeURIComponent(encodeURIComponent(conceptCode));
    return this.http.get<CodeSystemConcept>(`${this.baseUrl}/${codeSystemId}` + (version ? `/versions/${version}` : ``) + `/concepts/${conceptCode}`);
  }

  public searchEntityVersions(codeSystemId: string, params: CodeSystemEntityVersionSearchParams = {}): Observable<SearchResult<CodeSystemEntityVersion>> {
    return this.http.get<SearchResult<CodeSystemEntityVersion>>(`${this.baseUrl}/${codeSystemId}/entity-versions`, {params: SearchHttpParams.build(params)});
  }

  public loadEntityVersionReferences(codeSystemId: string, id: number): Observable<CodeSystemAssociation[]> {
    return this.http.get<CodeSystemAssociation[]>(`${this.baseUrl}/${codeSystemId}/entity-versions/${id}/references`);
  }

  public searchProperties(codeSystemId: string, params: EntityPropertySearchParams): Observable<SearchResult<EntityProperty>> {
    return this.http.get<SearchResult<EntityProperty>>(`${this.baseUrl}/${codeSystemId}/entity-properties`, {params: SearchHttpParams.build(params)});
  }

  public loadProvenances(codeSystem: string, version: string): Observable<Provenance[]> {
    return this.http.get<Provenance[]>(`${this.baseUrl}/${codeSystem}/provenances`, {params: SearchHttpParams.build({version})});
  }
}
