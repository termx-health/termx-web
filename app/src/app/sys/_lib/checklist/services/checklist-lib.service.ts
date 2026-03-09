import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {saveAs} from 'file-saver';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LorqueProcess} from 'term-web/sys/_lib/lorque/model/lorque-process';
import {Checklist} from 'term-web/sys/_lib/checklist/model/checklist';
import {ChecklistRule} from 'term-web/sys/_lib/checklist/model/checklist-rule';
import {ChecklistRuleSearchParams} from 'term-web/sys/_lib/checklist/model/checklist-rule-search-params';
import {ChecklistSearchParams} from 'term-web/sys/_lib/checklist/model/checklist-search-params';

@Injectable()
export class ChecklistLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/checklists`;

  public search(params: ChecklistSearchParams): Observable<SearchResult<Checklist>> {
    return this.http.get<SearchResult<Checklist>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public loadRule(id: number): Observable<ChecklistRule> {
    return this.http.get<ChecklistRule>(`${this.baseUrl}/rules/${id}`);
  }

  public searchRules(params: ChecklistRuleSearchParams): Observable<SearchResult<ChecklistRule>> {
    return this.http.get<SearchResult<ChecklistRule>>(`${this.baseUrl}/rules`, {params: SearchHttpParams.build(params)});
  }

  public startAssertionExport(resourceType: string, resourceId: string, resourceVersion: string): Observable<LorqueProcess> {
    return this.http.get(`${this.baseUrl}/assertions/export`,
      {params: SearchHttpParams.build({resourceType: resourceType, resourceId: resourceId, resourceVersion: resourceVersion})})
      .pipe(map(res => res as LorqueProcess));
  }

  public getAssertionExportResult(processId: number): void {
    this.http.get(`${this.baseUrl}/assertions/export/result/${processId}`, {
      responseType: 'blob',
      headers: new HttpHeaders({Accept: 'application/csv'})
    }).subscribe(res => saveAs(res, `assertion-errors.csv`));
  }
}
