import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Server, ServerLibService} from 'term-web/sys/_lib/space';

@Injectable()
export class ServerService extends ServerLibService {
  public save(ts: Server): Observable<Server> {
    if (ts.id) {
      return this.http.put<Server>(`${this.baseUrl}/${ts.id}`, ts);
    }
    return this.http.post<Server>(`${this.baseUrl}`, ts);
  }
}
