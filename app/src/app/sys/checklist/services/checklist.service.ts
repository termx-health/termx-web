import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {isDefined} from '@kodality-web/core-util';
import {ChecklistLibService, ChecklistRule} from 'term-web/sys/_lib';

@Injectable()
export class ChecklistService extends ChecklistLibService {

  public save(rule: ChecklistRule): Observable<ChecklistRule> {
    if (isDefined(rule.id)) {
      return this.http.put(`${this.baseUrl}/${rule.id}`, rule);
    }
    return this.http.post(`${this.baseUrl}`, rule);
  }
}
