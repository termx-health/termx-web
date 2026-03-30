import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@termx-health/core-util';
import {CodeName} from '@termx-health/util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Task, TaskSearchParams, Workflow} from 'term-web/task/_lib';

@Injectable()
export class TaskLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/tm`;

  public loadTask(number: string): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/tasks/${number}`);
  }

  public searchTasks(params: TaskSearchParams): Observable<SearchResult<Task>> {
    return this.http.get<SearchResult<Task>>(`${this.baseUrl}/tasks`, {params: SearchHttpParams.build(params)});
  }

  public loadProjects(): Observable<CodeName[]> {
    return this.http.get<CodeName[]>(`${this.baseUrl}/projects`);
  }

  public loadProjectWorkflows(code: string): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(`${this.baseUrl}/projects/${code}/workflows`);
  }
}
