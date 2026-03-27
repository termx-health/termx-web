import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {AuthoritativeResource, Server} from 'term-web/sys/_lib/space/model/server';
import {ServerSearchParams} from 'term-web/sys/_lib/space/model/server-search-params';

@Injectable()
export class ServerLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/servers`;

  public loadKinds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/kinds`);
  }

  public load(id: number): Observable<Server> {
    return this.http.get<Server>(`${this.baseUrl}/${id}`);
  }

  public search(params: ServerSearchParams): Observable<SearchResult<Server>> {
    return this.http.get<SearchResult<Server>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public loadResource(request: {serverCode: string, resourceType: string, resourceId: string}): Observable<{resource: string}> {
    return this.http.post<{resource: string}>(`${this.baseUrl}/resource`, request);
  }

  public exportEcosystem(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/ecosystem?download=true`, {
      responseType: 'blob'
    });
  }

  public importEcosystem(json: string): Observable<Server[]> {
    return this.http.post<Server[]>(`${this.baseUrl}/import/ecosystem`, json);
  }

  public previewAuthoritative(serverId: number, type: string, patterns: AuthoritativeResource[]): Observable<AuthoritativeResource[]> {
    return this.http.post<AuthoritativeResource[]>(`${this.baseUrl}/${serverId}/authoritative/${type}/preview`, patterns);
  }

  public loadMatchingResources(serverId: number, type: string): Observable<AuthoritativeResource[]> {
    return this.http.get<AuthoritativeResource[]>(`${this.baseUrl}/${serverId}/resources/${type}`);
  }
}
