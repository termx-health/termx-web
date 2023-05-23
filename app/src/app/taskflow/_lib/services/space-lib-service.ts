import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';

import {Space} from 'term-web/taskflow/_lib';

@Injectable()
export class SpaceLibService {
  protected baseUrl = `${environment.terminologyApi}/taskflow/spaces`;

  public constructor(protected http: HttpClient) { }

  public loadAll(): Observable<Space[]> {
    return this.http.get<Space[]>(`${this.baseUrl}`);
  }

  public load(id: number): Observable<Space> {
    return this.http.get<Space>(`${this.baseUrl}/${id}`);
  }
}
