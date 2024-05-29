import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'app/src/environments/environment';
import {Observable} from 'rxjs';
import {TerminologyServer} from '../model/terminology-server';
import {TerminologyServerSearchParams} from '../model/terminology-server-search-params';

@Injectable()
export class TerminologyServerLibService {
  protected baseUrl = `${environment.termxApi}/terminology-servers`;

  public constructor(protected http: HttpClient) { }

  public loadKinds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/kinds`);
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
