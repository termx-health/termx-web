import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class AuthLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/auth`;
  }

  public setCookie(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/set-cookie`, null);
  }
}
