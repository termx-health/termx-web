import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {NamingSystem} from '../model/naming-system';
import {NamingSystemSearchParams} from '../model/naming-system-search-params';

@Injectable()
export class NamingSystemLibService {
  protected baseUrl = `${environment.termxApi}/ts/naming-systems`;

  public constructor(protected http: HttpClient) { }

  public search(params: NamingSystemSearchParams = {}): Observable<SearchResult<NamingSystem>> {
    return this.http.get<SearchResult<NamingSystem>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public load(namingSystemId: string): Observable<NamingSystem> {
    return this.http.get<NamingSystem>(`${this.baseUrl}/${namingSystemId}`);
  }
}
