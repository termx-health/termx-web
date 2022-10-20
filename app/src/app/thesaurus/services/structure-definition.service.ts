import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {isDefined} from '@kodality-web/core-util';
import {StructureDefinition, StructureDefinitionLibService} from 'terminology-lib/thesaurus';

@Injectable()
export class StructureDefinitionService extends StructureDefinitionLibService {

  public save(structureDefinition: StructureDefinition): Observable<StructureDefinition> {
    if (isDefined(structureDefinition.id)) {
      return this.http.put(`${this.baseUrl}/structure-definitions/${structureDefinition.id}`, structureDefinition);
    }
    return this.http.post(`${this.baseUrl}/structure-definitions`, structureDefinition);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/structure-definitions/${id}`);
  }
}
