import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CodeSystemEntityVersionLibService} from 'terminology-lib/resources';

@Injectable()
export class CodeSystemEntityVersionService extends CodeSystemEntityVersionLibService {
  public activateVersion(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/activate`, {});
  }

  public retireVersion(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/retire`, {});
  }
}