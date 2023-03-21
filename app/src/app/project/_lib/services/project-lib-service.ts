import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Project} from '../model/project';
import {Package} from '../model/package';
import {ProjectSearchParams} from '../model/project-search-params';
import {ProjectDiff} from '../model/project-diff';

@Injectable()
export class ProjectLibService {
  protected baseUrl = `${environment.terminologyApi}/projects`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  public loadPackages(id: number): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.baseUrl}/${id}/packages`);
  }

  public search(params: ProjectSearchParams): Observable<SearchResult<Project>> {
    return this.http.get<SearchResult<Project>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public overview(request: {projectCode: string, packageCode: string, version: string}): Observable<{content: string}> {
    return this.http.post<{content: string}>(`${this.baseUrl}/overview`, request);
  }

  public diff(request: {projectCode: string, packageCode: string, version: string}): Observable<ProjectDiff> {
    return this.http.post<ProjectDiff>(`${this.baseUrl}/diff`, request);
  }
}
