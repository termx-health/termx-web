import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams} from '@termx-health/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {User} from 'term-web/user/_lib/model/user';

@Injectable()
export class UserLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/users`;

  public loadAll(params?: {roles?: string}): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
