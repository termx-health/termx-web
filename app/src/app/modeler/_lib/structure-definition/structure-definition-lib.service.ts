import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {isDefined, SearchHttpParams, SearchResult} from '@termx-health/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {StructureDefinition, StructureDefinitionVersion} from 'term-web/modeler/_lib/structure-definition/structure-definition';
import {StructureDefinitionSearchParams} from 'term-web/modeler/_lib/structure-definition/structure-definition-search-params';

@Injectable()
export class StructureDefinitionLibService {
  protected http = inject(HttpClient);

  protected baseUrl = environment.termxApi;

  public load(id: number, version?: string): Observable<StructureDefinition> {
    const params = version ? {version} : {};
    return this.http.get<StructureDefinition>(`${this.baseUrl}/structure-definitions/${id}`, {params});
  }

  public loadVersion(id: number, version: string): Observable<StructureDefinitionVersion> {
    return this.http.get<StructureDefinitionVersion>(`${this.baseUrl}/structure-definitions/${id}/versions/${version}`);
  }

  public listVersions(id: number): Observable<StructureDefinitionVersion[]> {
    return this.http.get<StructureDefinitionVersion[]>(`${this.baseUrl}/structure-definitions/${id}/versions`);
  }

  public import(request: { url?: string; content?: string; format?: string }): Observable<StructureDefinition> {
    return this.http.post<StructureDefinition>(`${this.baseUrl}/structure-definitions/import`, request);
  }

  public search(params: StructureDefinitionSearchParams = {}): Observable<SearchResult<StructureDefinition>> {
    return this.http.get<SearchResult<StructureDefinition>>(`${this.baseUrl}/structure-definitions`, {params: SearchHttpParams.build(params)});
  }

  public saveVersion(sdId: number, version: StructureDefinitionVersion): Observable<StructureDefinitionVersion> {
    if (isDefined(version.id)) {
      return this.http.put<StructureDefinitionVersion>(`${this.baseUrl}/structure-definitions/${sdId}/versions/${version.version}`, version);
    }
    return this.http.post<StructureDefinitionVersion>(`${this.baseUrl}/structure-definitions/${sdId}/versions`, version);
  }

  public save(structureDefinition: StructureDefinition): Observable<StructureDefinition> {
    if (isDefined(structureDefinition.id)) {
      return this.http.put(`${this.baseUrl}/structure-definitions/${structureDefinition.id}`, structureDefinition);
    }
    return this.http.post(`${this.baseUrl}/structure-definitions`, structureDefinition);
  }
}
