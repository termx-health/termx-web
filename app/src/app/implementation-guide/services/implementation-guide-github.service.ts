import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {GithubDiff, GithubStatus} from '../../integration/_lib/github/github';

@Injectable()
export class ImplementationGuideGithubService {
  protected baseUrl = `${environment.termxApi}/implementation-guides`;

  public constructor(protected http: HttpClient) { }

  public authenticate(igId: string, version: string, returnUrl: string): Observable<{isAuthenticated: boolean, redirectUrl: string}> {
    return this.http.post<any>(`${this.baseUrl}/${igId}/versions/${version}/github/authenticate`, {returnUrl});
  }

  public status(igId: string, version: string): Observable<IgGithubStatus> {
    return this.http.get<IgGithubStatus>(`${this.baseUrl}/${igId}/versions/${version}/github/status`);
  }

  public listBranches(igId: string, version: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/${igId}/versions/${version}/github/branches`);
  }

  public diff(igId: string, version: string, path: string): Observable<GithubDiff> {
    return this.http.get<GithubDiff>(`${this.baseUrl}/${igId}/versions/${version}/github/diff?file=${path}`);
  }

  public push(igId: string, version: string, message: string, files: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${igId}/versions/${version}/github/push`, {message, files});
  }

  public initIg(igId: string, version: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${igId}/versions/${version}/github/ig-initialize`, {});
  }

  public createBranch(igId: string, version: string, baseBranch: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${igId}/versions/${version}/github/create-branch`, {baseBranch});
  }

}

export class IgGithubStatus extends GithubStatus {
  public igInitialized: boolean;
  public branchExists: boolean;
}
