import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';

import {Workflow} from 'term-web/taskflow/_lib';

@Injectable()
export class WorkflowLibService {
  protected baseUrl = `${environment.terminologyApi}/taskflow/workflows`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<Workflow> {
    return this.http.get<Workflow>(`${this.baseUrl}/${id}`);
  }
}
