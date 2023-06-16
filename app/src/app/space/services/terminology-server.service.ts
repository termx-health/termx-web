import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {TerminologyServer, TerminologyServerLibService} from 'term-web/space/_lib';

@Injectable()
export class TerminologyServerService extends TerminologyServerLibService {
  public save(ts: TerminologyServer): Observable<TerminologyServer> {
    if (ts.id) {
      return this.http.put<TerminologyServer>(`${this.baseUrl}/${ts.id}`, ts);
    }
    return this.http.post<TerminologyServer>(`${this.baseUrl}`, ts);
  }
}
