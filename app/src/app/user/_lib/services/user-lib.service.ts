import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'app/src/environments/environment';
import {User} from '../model/user';

@Injectable()
export class UserLibService {
  protected baseUrl = `${environment.termxApi}/users`;

  public constructor(protected http: HttpClient) { }

  public loadAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`);
  }
}
