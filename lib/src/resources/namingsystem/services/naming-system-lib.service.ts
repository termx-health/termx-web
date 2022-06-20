import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {NamingSystem} from '../model/naming-system';
import {NamingSystemSearchParams} from '../model/naming-system-search-params';

@Injectable()
export class NamingSystemLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/naming-systems`;
  }

  public search(params: NamingSystemSearchParams = {}): Observable<SearchResult<NamingSystem>> {
    return this.http.get<SearchResult<NamingSystem>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public load(namingSystemId: string): Observable<NamingSystem> {
    return this.http.get<NamingSystem>(`${this.baseUrl}/${namingSystemId}`);
  }
}