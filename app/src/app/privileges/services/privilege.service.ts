import {Injectable} from '@angular/core';
import {PrivilegeLibService} from 'terminology-lib/auth/privileges';
import {Privilege} from 'terminology-lib/auth/privileges';
import {Observable} from 'rxjs';

@Injectable()
export class PrivilegeService extends PrivilegeLibService {
  public save(privilege: Privilege): Observable<Privilege> {
    if (privilege.id) {
      return this.http.put<Privilege>(`${this.baseUrl}/${privilege.id}`, privilege);
    }
    return this.http.post<Privilege>(`${this.baseUrl}`, privilege);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
