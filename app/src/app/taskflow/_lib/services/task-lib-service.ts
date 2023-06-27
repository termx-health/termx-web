import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';

import {Task, TaskActivity, TaskSearchParams} from 'term-web/taskflow/_lib';

@Injectable()
export class TaskLibService {
  protected baseUrl = `${environment.termxApi}/taskflow/tasks`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  public search(params: TaskSearchParams): Observable<SearchResult<Task>> {
    return this.http.get<SearchResult<Task>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public loadActivities(id: number): Observable<TaskActivity[]> {
    return this.http.get<TaskActivity[]>(`${this.baseUrl}/${id}/activities`);
  }
}
