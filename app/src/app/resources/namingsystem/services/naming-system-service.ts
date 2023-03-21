import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {NamingSystem, NamingSystemLibService} from 'term-web/resources/_lib';

@Injectable()
export class NamingSystemService extends NamingSystemLibService {

  public save(ns: NamingSystem): Observable<NamingSystem> {
    return this.http.post(this.baseUrl, ns);
  }

  public activate(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/activate`, {});
  }

  public retire(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/retire`, {});
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
