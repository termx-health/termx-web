import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {GithubDiff, GithubStatus} from '../../integration/_lib/github/github';

@Injectable()
export class SpaceGithubService {
  protected baseUrl = `${environment.termxApi}/spaces`;

  public constructor(protected http: HttpClient) { }

  public getProviders(): Observable<{[k: string]: string}> {
    return this.http.get<{[k: string]: string}>(`${this.baseUrl}/github/providers`);
  }

  public githubConfig(id: number): Observable<{enabled: boolean}> {
    return this.http.get<any>(`${this.baseUrl}/${id}/github`);
  }

  public authenticate(id: number, returnUrl: string): Observable<{isAuthenticated: boolean, redirectUrl: string}> {
    return this.http.post<any>(`${this.baseUrl}/${id}/github/authenticate`, {returnUrl});
  }

  public status(id: number): Observable<GithubStatus> {
    return this.http.get<GithubStatus>(`${this.baseUrl}/${id}/github/status`);
  }

  public diff(id: number, path: string): Observable<GithubDiff> {
    return this.http.get<GithubDiff>(`${this.baseUrl}/${id}/github/diff?file=${path}`);
  }

  public push(id: number, message: string, files: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/github/push`, {message, files});
  }

  public pull(id: number, files: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/github/pull`, {files});
  }

}
