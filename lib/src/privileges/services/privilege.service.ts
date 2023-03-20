import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PrivilegeSearchParams} from '../model/privilege-search-params';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {Observable} from 'rxjs';
import {Privilege} from '../model/privilege';
import {TERMINOLOGY_API_URL} from '../../terminology-lib.config';

@Injectable()
export class PrivilegeService {
  protected baseUrl;

  public constructor(
    @Inject(TERMINOLOGY_API_URL) url: string,
    protected http: HttpClient
  ) {
    this.baseUrl = `${url}/auth/privileges`;
  }

  public load(id: number): Observable<Privilege> {
    return this.http.get<Privilege>(`${this.baseUrl}/${id}`);
  }

  public search(params: PrivilegeSearchParams): Observable<SearchResult<Privilege>> {
    return this.http.get<SearchResult<Privilege>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
