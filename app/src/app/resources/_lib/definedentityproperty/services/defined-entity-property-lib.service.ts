import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {DefinedEntityProperty} from './../model/defined-entity-property';
import {DefinedEntityPropertySearchParams} from './../model/defined-entity-property-search-params';

@Injectable()
export class DefinedEntityPropertyLibService {
  protected baseUrl = `${environment.termxApi}/ts/defined-entity-properties`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<DefinedEntityProperty> {
    return this.http.get<DefinedEntityProperty>(`${this.baseUrl}/${id}`);
  }

  public search(params: DefinedEntityPropertySearchParams = {}): Observable<SearchResult<DefinedEntityProperty>> {
    return this.http.get<SearchResult<DefinedEntityProperty>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
