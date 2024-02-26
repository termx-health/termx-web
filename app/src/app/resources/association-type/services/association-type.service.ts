import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AssociationType, AssociationTypeLibService} from 'term-web/resources/_lib';

@Injectable()
export class AssociationTypeService extends AssociationTypeLibService {

  public save(association: AssociationType): Observable<AssociationType> {
    return this.http.post(this.baseUrl, association);
  }

  public delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${code}`);
  }
}
