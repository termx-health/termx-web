import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Privilege} from '../model/privilege';
import {PrivilegeSearchParams} from '../model/privilege-search-params';

@Injectable()
export class PrivilegeService {
  protected baseUrl = `${environment.termxApi}/uam/privileges`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<Privilege> {
    return this.http.get<Privilege>(`${this.baseUrl}/${id}`);
  }

  public search(params: PrivilegeSearchParams): Observable<SearchResult<Privilege>> {
    return this.http.get<SearchResult<Privilege>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
