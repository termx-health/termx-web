import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {TerminologyServer} from 'term-web/sys/_lib/space/model/terminology-server';
import {TerminologyServerSearchParams} from 'term-web/sys/_lib/space/model/terminology-server-search-params';

@Injectable()
export class TerminologyServerLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/terminology-servers`;

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

  public exportEcosystem(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/ecosystem?download=true`, {
      responseType: 'blob'
    });
  }

  public importEcosystem(json: string): Observable<TerminologyServer[]> {
    return this.http.post<TerminologyServer[]>(`${this.baseUrl}/import/ecosystem`, json);
  }
}
