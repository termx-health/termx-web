import {Injectable} from '@angular/core';
import {isDefined} from '@kodality-web/core-util';
import {Observable} from 'rxjs';
import {Ucum, UcumLibService} from 'term-web/ucum/_lib';

@Injectable()
export class UcumService extends UcumLibService {
  public save(mu: Ucum): Observable<Ucum> {
    if (isDefined(mu.id)) {
      return this.http.put(`${this.baseUrl}/${mu.id}`, mu);
    }
    return this.http.post(this.baseUrl, mu);
  }
}
