import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {isDefined} from '@kodality-web/core-util';
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

  public createAssertion(checklistId: number, passed: boolean): Observable<any> {
    return this.http.post(`${this.baseUrl}/${checklistId}/assertions`, {passed: passed});
  }

  public runChecks(request: ChecklistValidationRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/assertions/run-checks`, request);
  }
}
