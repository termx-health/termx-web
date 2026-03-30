import {HttpClient, HttpContext} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@termx-health/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {DefinedProperty} from 'term-web/resources/_lib/defined-property/model/defined-property';
import {DefinedPropertySearchParams} from 'term-web/resources/_lib/defined-property/model/defined-property-search-params';

@Injectable()
export class DefinedPropertyLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/ts/defined-properties`;

  public load(id: number): Observable<DefinedProperty> {
    return this.http.get<DefinedProperty>(`${this.baseUrl}/${id}`);
  }

  public search(params: DefinedPropertySearchParams = {}, context?: HttpContext): Observable<SearchResult<DefinedProperty>> {
    return this.http.get<SearchResult<DefinedProperty>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params), context});
  }
}
