import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {ChecklistRule, ChecklistRuleSearchParams} from 'term-web/sys/_lib';

@Injectable()
export class ChecklistLibService {
  protected baseUrl = `${environment.termxApi}/checklist-rules`;

  public constructor(protected http: HttpClient) { }

  public loadRule(id: number): Observable<ChecklistRule> {
    return this.http.get<ChecklistRule>(`${this.baseUrl}/${id}`);
  }

  public searchRules(params: ChecklistRuleSearchParams): Observable<SearchResult<ChecklistRule>> {
    return this.http.get<SearchResult<ChecklistRule>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
