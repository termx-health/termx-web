import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {User} from '../model/user';

@Injectable()
export class UserLibService {
  protected baseUrl = `${environment.termxApi}/users`;

  public constructor(protected http: HttpClient) { }

  public loadAll(params?: {roles?: string}): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
