import {HttpClient, HttpContext} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {HttpCacheService} from '@termx-health/core-util';
import {MuiSkipErrorHandler} from '@termx-health/ui';
import {environment} from 'environments/environment';
import {catchError, map, Observable, of} from 'rxjs';


const SKIP_HTTP_ERROR = new HttpContext().set(MuiSkipErrorHandler, true);

@Injectable({providedIn: 'root'})
export class InfoService {
  private readonly baseUrl = `${environment.termxApi}/info`;
  private http = inject(HttpClient);
  private cache = inject(HttpCacheService);

  public ping(): Observable<boolean> {
    return this.http.get(`${this.baseUrl}`, {context: SKIP_HTTP_ERROR}).pipe(map(() => true), catchError(() => of(false)));
  }

  public version(): Observable<string> {
    return this.cache.put('version', this.http.get<{version: string}>(`${this.baseUrl}`, {context: SKIP_HTTP_ERROR})).pipe(map(r => r.version));
  }

  /** Full backend build metadata from /info (version + build-time/commit/pr, the latter populated after PR #175 lands). */
  public serviceInfo(): Observable<WebBuild | null> {
    return this.cache.put('service-info', this.http.get<Record<string, string>>(`${this.baseUrl}`, {context: SKIP_HTTP_ERROR})).pipe(
      map(r => ({version: r?.['version'], buildTime: r?.['build-time'], commit: r?.['commit'], pr: r?.['pr']})),
      catchError(() => of(null))
    );
  }

  public modules(): Observable<string[]> {
    return this.cache.put('modules', this.http.get<string[]>(`${this.baseUrl}/modules`, {context: SKIP_HTTP_ERROR}));
  }

  /** Build metadata of the deployed web bundle (etc/generate-version.mjs → /version.json). Null if absent (e.g. `ng serve`). */
  public webBuild(): Observable<WebBuild | null> {
    return this.http.get<WebBuild>(`${environment.baseHref}version.json`, {context: SKIP_HTTP_ERROR}).pipe(catchError(() => of(null)));
  }
}

export interface WebBuild {
  version?: string;
  buildTime?: string;
  commit?: string;
  pr?: string;
}
