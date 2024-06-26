import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {isDefined, SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {StructureDefinition} from './structure-definition';
import {StructureDefinitionSearchParams} from './structure-definition-search-params';

@Injectable()
export class StructureDefinitionLibService {
  protected baseUrl = environment.termxApi;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<StructureDefinition> {
    return this.http.get<StructureDefinition>(`${this.baseUrl}/structure-definitions/${id}`);
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
