import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {ChecklistSearchParams} from '../model/checklist-search-params';
import {ChecklistRuleSearchParams} from '../model/checklist-rule-search-params';
import {Checklist} from '../model/checklist';
import {ChecklistRule} from '../model/checklist-rule';

@Injectable()
export class ChecklistLibService {
  protected baseUrl = `${environment.termxApi}/checklists`;

  public constructor(protected http: HttpClient) { }

  public search(params: ChecklistSearchParams): Observable<SearchResult<Checklist>> {
    return this.http.get<SearchResult<Checklist>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public loadRule(id: number): Observable<ChecklistRule> {
    return this.http.get<ChecklistRule>(`${this.baseUrl}/rules/${id}`);
  }

  public searchRules(params: ChecklistRuleSearchParams): Observable<SearchResult<ChecklistRule>> {
    return this.http.get<SearchResult<ChecklistRule>>(`${this.baseUrl}/rules`, {params: SearchHttpParams.build(params)});
  }
}
