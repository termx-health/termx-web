import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpContext} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpCacheService} from '@kodality-web/core-util';
import {MuiSkipErrorHandler} from '@kodality-web/marina-ui';


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

  public modules(): Observable<string[]> {
    return this.cache.put('modules', this.http.get<string[]>(`${this.baseUrl}/modules`, {context: SKIP_HTTP_ERROR}));
  }
}
