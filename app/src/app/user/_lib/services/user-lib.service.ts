import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'app/src/environments/environment';
import {User} from '../model/user';
import {SearchHttpParams} from '@kodality-web/core-util';

@Injectable()
export class UserLibService {
  protected baseUrl = `${environment.termxApi}/users`;

  public constructor(protected http: HttpClient) { }

  public loadAll(params?: {roles?: string}): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
