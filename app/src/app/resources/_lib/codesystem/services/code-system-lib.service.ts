import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';

import {environment} from 'environments/environment';
import {CodeSystemVersion} from '../model/code-system-version';
import {EntityProperty, EntityPropertyValue} from '../model/entity-property';
import {Designation} from '../../designation';
import {CodeSystemSupplement} from '../model/code-system-supplement';
import {CodeSystemSearchParams} from '../model/code-system-search-params';
import {CodeSystem} from '../model/code-system';
import {CodeSystemVersionSearchParams} from '../model/code-system-version-search-params';
import {ConceptSearchParams} from '../model/concept-search-params';
import {CodeSystemConcept} from '../model/code-system-concept';
import {EntityPropertySearchParams} from '../model/entity-property-search-params';
import {CodeSystemEntityVersionSearchParams} from '../model/code-system-entity-version-search-params';
import {CodeSystemEntityVersion} from '../model/code-system-entity';
import {CodeSystemAssociation} from '../model/code-system-association';

@Injectable()
export class CodeSystemLibService {
  protected baseUrl = `${environment.terminologyApi}/ts/code-systems`;

  public constructor(protected http: HttpClient) { }

  public load(codeSystemId: string, decorate?: boolean): Observable<CodeSystem> {
    return this.http.get<CodeSystem>(`${this.baseUrl}/${codeSystemId}?decorate=${decorate}`);
  }

  public loadVersion(codeSystemId: string, version: string): Observable<CodeSystemVersion> {
    return this.http.get<CodeSystemVersion>(`${this.baseUrl}/${codeSystemId}/versions/${version}`);
  }

  public loadConcept(codeSystemId: string, conceptCode: string): Observable<CodeSystemConcept> {
    return this.http.get<CodeSystemConcept>(`${this.baseUrl}/${codeSystemId}/concepts/${conceptCode}`);
  }

  public loadEntityProperty(codeSystemId: string, entityPropertyId: number): Observable<EntityProperty> {
    return this.http.get<EntityProperty>(`${this.baseUrl}/${codeSystemId}/entity-properties/${entityPropertyId}`);
  }

  public loadEntityPropertyValue(codeSystemId: string, entityPropertyValueId: number): Observable<EntityPropertyValue> {
    return this.http.get<EntityPropertyValue>(`${this.baseUrl}/${codeSystemId}/entity-property-values/${entityPropertyValueId}`);
  }

  public loadDesignation(codeSystemId: string, designationId: number): Observable<Designation> {
    return this.http.get<Designation>(`${this.baseUrl}/${codeSystemId}/designations/${designationId}`);
  }

  public loadAssociation(codeSystemId: string, associationId: number): Observable<CodeSystemAssociation> {
    return this.http.get<Designation>(`${this.baseUrl}/${codeSystemId}/associations/${associationId}`);
  }

  public loadSupplement(codeSystemId: string, supplementId: number): Observable<CodeSystemSupplement> {
    return this.http.get<CodeSystemSupplement>(`${this.baseUrl}/${codeSystemId}/supplements/${supplementId}`);
  }

  public search(params: CodeSystemSearchParams = {}): Observable<SearchResult<CodeSystem>> {
    return this.http.get<SearchResult<CodeSystem>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public searchVersions(codeSystemId: string, params: CodeSystemVersionSearchParams = {}): Observable<SearchResult<CodeSystemVersion>> {
    return this.http.get<SearchResult<CodeSystemVersion>>(`${this.baseUrl}/${codeSystemId}/versions`, {params: SearchHttpParams.build(params)});
  }

  public searchConcepts(codeSystemId: string, params: ConceptSearchParams): Observable<SearchResult<CodeSystemConcept>> {
    return this.http.get<SearchResult<CodeSystemConcept>>(`${this.baseUrl}/${codeSystemId}/concepts`, {params: SearchHttpParams.build(params)});
  }

  public searchProperties(codeSystemId: string, params: EntityPropertySearchParams): Observable<SearchResult<EntityProperty>> {
    return this.http.get<SearchResult<EntityProperty>>(`${this.baseUrl}/${codeSystemId}/entity-properties`, {params: SearchHttpParams.build(params)});
  }

  public searchEntityVersions(codeSystemId: string, params: CodeSystemEntityVersionSearchParams = {}): Observable<SearchResult<CodeSystemEntityVersion>> {
    return this.http.get<SearchResult<CodeSystemEntityVersion>>(`${this.baseUrl}/${codeSystemId}/entity-versions`, {params: SearchHttpParams.build(params)});
  }
}
