import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {Workflow, WorkflowSearchParams} from 'term-web/taskflow/_lib';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';

@Injectable()
export class WorkflowLibService {
  protected baseUrl = `${environment.termxApi}/taskflow/workflows`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<Workflow> {
    return this.http.get<Workflow>(`${this.baseUrl}/${id}`);
  }

  public search(params: WorkflowSearchParams): Observable<SearchResult<Workflow>> {
    return this.http.get<SearchResult<Workflow>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
