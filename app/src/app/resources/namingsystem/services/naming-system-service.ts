import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {NamingSystemLibService} from 'terminology-lib/resources/namingsystem/services/naming-system-lib.service';
import {NamingSystem} from 'terminology-lib/resources/namingsystem/model/naming-system';

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
}