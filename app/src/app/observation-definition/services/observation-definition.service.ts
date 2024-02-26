import {Injectable} from '@angular/core';
import {ObservationDefinition, ObservationDefinitionImportRequest, ObservationDefinitionLibService} from 'app/src/app/observation-definition/_lib';
import {Observable} from 'rxjs';
import {JobLogResponse} from 'term-web/sys/_lib';


@Injectable()
export class ObservationDefinitionService extends ObservationDefinitionLibService {
  public save(org: ObservationDefinition): Observable<ObservationDefinition> {
    if (org.id) {
      return this.http.put(`${this.baseUrl}/${org.id}`, org);
    }
    return this.http.post(`${this.baseUrl}`, org);
  }

  public import(request: ObservationDefinitionImportRequest): Observable<JobLogResponse> {
    return this.http.post(`${this.baseUrl}/import`, request);
  }
}
