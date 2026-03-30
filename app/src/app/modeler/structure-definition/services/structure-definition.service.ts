import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {StructureDefinitionLibService} from 'term-web/modeler/_lib';

@Injectable()
export class StructureDefinitionService extends StructureDefinitionLibService {

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/structure-definitions/${id}`);
  }

  public duplicateVersion(sdId: number, sourceVersion: string, targetVersion: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/structure-definitions/${sdId}/versions/${sourceVersion}/duplicate`, {version: targetVersion});
  }

  public recalculateReferences(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/structure-definitions/${id}/recalculate-references`, {});
  }
}
