import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {StructureDefinitionLibService} from 'term-web/modeler/_lib';

@Injectable()
export class StructureDefinitionService extends StructureDefinitionLibService {

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/structure-definitions/${id}`);
  }
}
