import {Concept, Designation, ValueSet, ValueSetLibService, ValueSetVersion} from 'terminology-lib/resources';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class ValueSetService extends ValueSetLibService {
  public save(valueSet: ValueSet): Observable<ValueSet> {
    return this.http.post(this.baseUrl, valueSet);
  }

  public saveVersion(valueSetId: string, version: ValueSetVersion): Observable<ValueSetVersion> {
    if (version.id && version.version) {
      return this.http.put(`${this.baseUrl}/${valueSetId}/versions/${version.id}`, version);
    }
    return this.http.post(`${this.baseUrl}/${valueSetId}/versions`, version);
  }

  public activateVersion(valueSetId: string, version: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/activate`, {});
  }

  public retireVersion(valueSetId: string, version: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/retire`, {});
  }

  public saveConcepts(valueSetId: string, version: string, concepts: Concept[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/concepts`, {concepts});
  }

  public saveDesignations(valueSetId: string, version: string, designations: Designation[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/designations`, {designations});
  }
}
