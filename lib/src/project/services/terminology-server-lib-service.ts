import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TerminologyServer} from '../model/terminology-server';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {TerminologyServerSearchParams} from '../model/terminology-server-search-params';

@Injectable()
export class TerminologyServerLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/terminology-servers`;
  }

  public load(id: number): Observable<TerminologyServer> {
    return this.http.get<TerminologyServer>(`${this.baseUrl}/${id}`);
  }

  public search(params: TerminologyServerSearchParams): Observable<SearchResult<TerminologyServer>> {
    return this.http.get<SearchResult<TerminologyServer>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public loadResource(request: {serverCode: string, resourceType: string, resourceId: string}): Observable<{resource: string}> {
    return this.http.post<{resource: string}>(`${this.baseUrl}/resource`, request);
  }
}
