import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ObservationDefinition, ObservationDefinitionLibService} from 'term-web/supplement/_lib';


@Injectable()
export class ObservationDefinitionService extends ObservationDefinitionLibService {
  public save(org: ObservationDefinition): Observable<ObservationDefinition> {
    if (org.id) {
      return this.http.put(`${this.baseUrl}/${org.id}`, org);
    }
    return this.http.post(`${this.baseUrl}`, org);
  }
}
