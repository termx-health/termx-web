import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {StructureDefinition} from '../model/structure-definition';
import {StructureDefinitionSearchParams} from '../model/structure-definition-search-params';

@Injectable()
export class StructureDefinitionLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}`;
  }

  public load(id: number): Observable<StructureDefinition> {
    return this.http.get<StructureDefinition>(`${this.baseUrl}/structure-definitions/${id}`);
  }

  public search(params: StructureDefinitionSearchParams = {}): Observable<SearchResult<StructureDefinition>> {
    return this.http.get<SearchResult<StructureDefinition>>(`${this.baseUrl}/structure-definitions`, {params: SearchHttpParams.build(params)});
  }
}
