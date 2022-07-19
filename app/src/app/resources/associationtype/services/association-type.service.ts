import {Injectable} from '@angular/core';
import {AssociationType, AssociationTypeLibService} from 'terminology-lib/resources';
import {Observable} from 'rxjs';

@Injectable()
export class AssociationTypeService extends AssociationTypeLibService {
  public save(association: AssociationType): Observable<AssociationType> {
    return this.http.post(this.baseUrl, association);
  }
}