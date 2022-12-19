import {ValueSet, ValueSetVersionConcept, ValueSetLibService, ValueSetVersion, ValueSetVersionRule} from 'terminology-lib/resources';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class ValueSetService extends ValueSetLibService {

  public save(valueSet: ValueSet): Observable<ValueSet> {
    return this.http.post(this.baseUrl, valueSet);
  }

  public delete(valueSetId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${valueSetId}`);
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

  public saveVersionAsDraft(valueSetId: string, version: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/draft`, {});
  }

  public saveConcept(valueSetId: string, version: string, concept: ValueSetVersionConcept): Observable<ValueSetVersionConcept> {
    if (concept.id) {
      return this.http.put<ValueSetVersionConcept>(`${this.baseUrl}/${valueSetId}/versions/${version}/concepts/${concept.id}`, concept);
    }
    return this.http.post<ValueSetVersionConcept>(`${this.baseUrl}/${valueSetId}/versions/${version}/concepts`, concept);
  }

  public deleteConcept(valueSetId: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${valueSetId}/concepts/${id}`);
  }

  public saveRule(valueSetId: string, ruleSetId: number, rule: ValueSetVersionRule): Observable<ValueSetVersionRule> {
    if (rule.id) {
      return this.http.put<ValueSetVersionRule>(`${this.baseUrl}/${valueSetId}/rule-sets/${ruleSetId}/rules/${rule.id}`, rule);
    }
    return this.http.post<ValueSetVersionRule>(`${this.baseUrl}/${valueSetId}/rule-sets/${ruleSetId}/rules`, rule);
  }

  public deleteRule(valueSetId: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${valueSetId}/rules/${id}`);
  }
}
