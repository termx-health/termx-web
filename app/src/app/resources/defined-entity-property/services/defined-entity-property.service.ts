import {Injectable} from '@angular/core';
import {DefinedEntityProperty} from 'term-web/resources/_lib';
import {Observable} from 'rxjs';
import {DefinedEntityPropertyLibService} from 'term-web/resources/_lib/definedentityproperty/services/defined-entity-property-lib.service';

@Injectable()
export class DefinedEntityPropertyService extends DefinedEntityPropertyLibService {

  public save(entityProperty: DefinedEntityProperty): Observable<DefinedEntityProperty> {
    if (entityProperty.id) {
      return this.http.put<DefinedEntityProperty>(`${this.baseUrl}/${entityProperty.id}`, entityProperty);
    }
    return this.http.post<DefinedEntityProperty>(`${this.baseUrl}`, entityProperty);
  }
}
