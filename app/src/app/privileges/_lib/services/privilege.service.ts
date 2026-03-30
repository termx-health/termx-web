import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@termx-health/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Privilege} from 'term-web/privileges/_lib/model/privilege';
import {PrivilegeSearchParams} from 'term-web/privileges/_lib/model/privilege-search-params';

@Injectable()
export class PrivilegeService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/uam/privileges`;

  public load(id: number): Observable<Privilege> {
    return this.http.get<Privilege>(`${this.baseUrl}/${id}`);
  }

  public search(params: PrivilegeSearchParams): Observable<SearchResult<Privilege>> {
    return this.http.get<SearchResult<Privilege>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
