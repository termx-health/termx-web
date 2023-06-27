import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
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
}
