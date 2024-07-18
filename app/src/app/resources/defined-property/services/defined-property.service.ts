import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {DefinedProperty} from 'term-web/resources/_lib';
import {DefinedPropertyLibService} from 'term-web/resources/_lib/defined-property/services/defined-property-lib.service';

@Injectable()
export class DefinedPropertyService extends DefinedPropertyLibService {

  public save(entityProperty: DefinedProperty): Observable<DefinedProperty> {
    if (entityProperty.id) {
      return this.http.put<DefinedProperty>(`${this.baseUrl}/${entityProperty.id}`, entityProperty);
    }
    return this.http.post<DefinedProperty>(`${this.baseUrl}`, entityProperty);
  }

  public updateRelated(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/update-related`, {});
  }
}
