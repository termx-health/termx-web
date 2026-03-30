import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@termx-health/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {NamingSystem} from 'term-web/resources/_lib/naming-system/model/naming-system';
import {NamingSystemSearchParams} from 'term-web/resources/_lib/naming-system/model/naming-system-search-params';

@Injectable()
export class NamingSystemLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/ts/naming-systems`;

  public search(params: NamingSystemSearchParams = {}): Observable<SearchResult<NamingSystem>> {
    return this.http.get<SearchResult<NamingSystem>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public load(namingSystemId: string): Observable<NamingSystem> {
    return this.http.get<NamingSystem>(`${this.baseUrl}/${namingSystemId}`);
  }
}
