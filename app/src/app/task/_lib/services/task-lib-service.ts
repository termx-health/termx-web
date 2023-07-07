import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Task, TaskSearchParams, Workflow} from 'term-web/task/_lib';
import {CodeName} from '@kodality-web/marina-util';

@Injectable()
export class TaskLibService {
  protected baseUrl = `${environment.termxApi}/tm`;

  public constructor(protected http: HttpClient) { }

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
