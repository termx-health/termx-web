import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';

import {Project} from 'term-web/taskflow/_lib';

@Injectable()
export class ProjectLibService {
  protected baseUrl = `${environment.termxApi}/taskflow/projects`;

  public constructor(protected http: HttpClient) { }

  public loadAll(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}`);
  }

  public load(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }
}
