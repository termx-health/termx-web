import {Injectable} from '@angular/core';
import {isDefined} from '@kodality-web/core-util';
import {Observable} from 'rxjs';
import {Checklist, ChecklistLibService, ChecklistRule, ChecklistValidationRequest} from 'term-web/sys/_lib';

@Injectable()
export class ChecklistService extends ChecklistLibService {

  public save(checklist: Checklist[], resourceType: string, resourceId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}`, {checklist: checklist, resourceType: resourceType, resourceId: resourceId});
  }

  public saveRule(rule: ChecklistRule): Observable<ChecklistRule> {
    if (isDefined(rule.id)) {
      return this.http.put(`${this.baseUrl}/rules/${rule.id}`, rule);
    }
    return this.http.post(`${this.baseUrl}/rules`, rule);
  }

  public deleteRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rules/${id}`);
  }

  public createAssertion(checklistId: number, resourceVersion: string, passed: boolean): Observable<any> {
    return this.http.post(`${this.baseUrl}/${checklistId}/assertions`, {resourceVersion: resourceVersion, passed: passed});
  }

  public runChecks(request: ChecklistValidationRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/assertions/run-checks`, request);
  }
}
