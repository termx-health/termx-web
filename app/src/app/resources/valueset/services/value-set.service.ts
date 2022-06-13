import {ValueSet, ValueSetConcept, ValueSetLibService, ValueSetRuleSet, ValueSetVersion} from 'terminology-lib/resources';
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

  public saveConcepts(valueSetId: string, version: string, concepts: ValueSetConcept[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/concepts`, {concepts});
  }

  public expandByRuleSet(ruleSet: ValueSetRuleSet): Observable<ValueSetConcept[]> {
    return this.http.post<ValueSetConcept[]>(`${this.baseUrl}/expand`, ruleSet);
  }
}
