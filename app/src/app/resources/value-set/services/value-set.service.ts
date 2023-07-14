import {ValueSetLibService, ValueSetTransactionRequest, ValueSetVersion, ValueSetVersionRule} from 'term-web/resources/_lib';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

@Injectable()
export class ValueSetService extends ValueSetLibService {

  public saveValueSet(request: ValueSetTransactionRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transaction`, request);
  }

  public changeValueSetId(currentId: string, newId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${currentId}/change-id`, {id: newId});
  }

  public deleteValueSet(valueSetId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${valueSetId}`);
  }

  public saveValueSetVersion(valueSetId: string, version: ValueSetVersion): Observable<ValueSetVersion> {
    if (version.id && version.version) {
      return this.http.put(`${this.baseUrl}/${valueSetId}/versions/${version.version}`, version);
    }
    return this.http.post(`${this.baseUrl}/${valueSetId}/versions`, version);
  }

  public changeValueSetVersionStatus(valueSetId: string, version: string, status: 'draft' | 'active' | 'retired'): Observable<void> {
    if (status === 'draft') {
      return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/draft`, {});
    }
    if (status === 'active') {
      return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/activate`, {});
    }
    if (status === 'retired') {
      return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/retire`, {});
    }
    return of();
  }

  public duplicateValueSetVersion(valueSetId: string, version: string, duplicateRequest: {valueSet: string, version: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/duplicate`, duplicateRequest);
  }

  public deleteValueSetVersion(valueSetId: string, version: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${valueSetId}/versions/${version}`);
  }

  public saveRule(valueSetId: string, valueSetVersion: string, rule: ValueSetVersionRule): Observable<ValueSetVersionRule> {
    if (rule.id) {
      return this.http.put<ValueSetVersionRule>(`${this.baseUrl}/${valueSetId}/versions/${valueSetVersion}/rules/${rule.id}`, rule);
    }
    return this.http.post<ValueSetVersionRule>(`${this.baseUrl}/${valueSetId}/versions/${valueSetVersion}/rules`, rule);
  }

  public deleteRule(valueSetId: string, valueSetVersion: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${valueSetId}/versions/${valueSetVersion}/rules/${id}`);
  }
}
