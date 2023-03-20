import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Privilege, PrivilegeService as PrivilegeLibService} from '@terminology/core';

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
