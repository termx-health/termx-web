import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';

import {TaskflowUser} from 'term-web/taskflow/_lib';

@Injectable()
export class UserLibService {
  protected baseUrl = `${environment.terminologyApi}/taskflow/users`;

  public constructor(protected http: HttpClient) { }

  public load(): Observable<TaskflowUser[]> {
    return this.http.get<TaskflowUser[]>(`${this.baseUrl}`);
  }
}
