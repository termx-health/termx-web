import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {MsDevOpsDiff, MsDevOpsStatus} from 'term-web/integration/_lib/msDevOps/msDevOps';

@Injectable()
export class SpaceMsDevOpsService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/spaces`;

  public getProviders(): Observable<{[k: string]: string}> {
    return this.http.get<{[k: string]: string}>(`${this.baseUrl}/msdevops/providers`);
  }

  public msDevOpsConfig(id: number): Observable<{enabled: boolean}> {
    return this.http.get<any>(`${this.baseUrl}/${id}/msdevops`);
  }

  public authenticate(id: number, returnUrl: string): Observable<{isAuthenticated: boolean, redirectUrl: string}> {
    return this.http.post<any>(`${this.baseUrl}/${id}/msdevops/authenticate`, {returnUrl});
  }

  public status(id: number): Observable<MsDevOpsStatus> {
    return this.http.get<MsDevOpsStatus>(`${this.baseUrl}/${id}/msdevops/status`);
  }

  public diff(id: number, path: string): Observable<MsDevOpsDiff> {
    return this.http.get<MsDevOpsDiff>(`${this.baseUrl}/${id}/msdevops/diff?file=${path}`);
  }

  public push(id: number, message: string, files: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/msdevops/push`, {message, files});
  }

  public pull(id: number, files: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/msdevops/pull`, {files});
  }

}
