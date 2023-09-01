import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Space} from '../model/space';
import {Package} from '../model/package';
import {SpaceSearchParams} from '../model/space-search-params';
import {SpaceDiff} from '../model/space-diff';
import {GithubDiff, GithubStatus} from 'term-web/integration/_lib/github/github';

@Injectable()
export class SpaceLibService {
  protected baseUrl = `${environment.termxApi}/spaces`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<Space> {
    return this.http.get<Space>(`${this.baseUrl}/${id}`);
  }

  public loadPackages(id: number): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.baseUrl}/${id}/packages`);
  }

  public search(params: SpaceSearchParams): Observable<SearchResult<Space>> {
    return this.http.get<SearchResult<Space>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public overview(request: {spaceCode: string, packageCode: string, version: string}): Observable<{content: string}> {
    return this.http.post<{content: string}>(`${this.baseUrl}/overview`, request);
  }

  public diff(request: {spaceCode: string, packageCode: string, version: string}): Observable<SpaceDiff> {
    return this.http.post<SpaceDiff>(`${this.baseUrl}/diff`, request);
  }

  public githubConfig(id: number): Observable<{enabled: boolean}> {
    return this.http.get<any>(`${this.baseUrl}/${id}/github`);
  }

  public githubAuthenticate(id: number, returnUrl: string): Observable<{isAuthenticated: boolean, redirectUrl: string}> {
    return this.http.post<any>(`${this.baseUrl}/${id}/github/authenticate`, {returnUrl});
  }

  public githubStatus(id: number): Observable<GithubStatus> {
    return this.http.get<GithubStatus>(`${this.baseUrl}/${id}/github/status`);
  }

  public githubDiff(id: number, path: string): Observable<GithubDiff> {
    return this.http.get<GithubDiff>(`${this.baseUrl}/${id}/github/diff?file=${path}`);
  }

  public githubPush(id: number, message: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/github/push`, {message});
  }

  public githubPull(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/github/pull`, {});
  }

}
