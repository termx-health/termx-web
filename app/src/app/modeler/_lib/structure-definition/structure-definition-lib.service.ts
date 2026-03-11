import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {isDefined, SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {StructureDefinition} from 'term-web/modeler/_lib/structure-definition/structure-definition';
import {StructureDefinitionSearchParams} from 'term-web/modeler/_lib/structure-definition/structure-definition-search-params';

@Injectable()
export class StructureDefinitionLibService {
  protected http = inject(HttpClient);

  protected baseUrl = environment.termxApi;

  public load(id: number, version?: string): Observable<StructureDefinition> {
    const params = version ? {version} : {};
    return this.http.get<StructureDefinition>(`${this.baseUrl}/structure-definitions/${id}`, {params});
  }

  public import(request: { url?: string; content?: string; format?: string }): Observable<StructureDefinition> {
    return this.http.post<StructureDefinition>(`${this.baseUrl}/structure-definitions/import`, request);
  }

  public search(params: StructureDefinitionSearchParams = {}): Observable<SearchResult<StructureDefinition>> {
    return this.http.get<SearchResult<StructureDefinition>>(`${this.baseUrl}/structure-definitions`, {params: SearchHttpParams.build(params)});
  }

  public save(structureDefinition: StructureDefinition): Observable<StructureDefinition> {
    if (isDefined(structureDefinition.id)) {
      return this.http.put(`${this.baseUrl}/structure-definitions/${structureDefinition.id}`, structureDefinition);
    }
    return this.http.post(`${this.baseUrl}/structure-definitions`, structureDefinition);
  }
}
