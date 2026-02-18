import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Template} from 'term-web/wiki/_lib/template/models/template';
import {TemplateSearchParams} from 'term-web/wiki/_lib/template/models/template-search-params';

@Injectable()
export class TemplateLibService {
  protected http = inject(HttpClient);

  protected baseUrl = environment.termxApi;

  public loadTemplate(id: number): Observable<Template> {
    return this.http.get<Template>(`${this.baseUrl}/templates/${id}`);
  }

  public searchTemplates(params: TemplateSearchParams = {}): Observable<SearchResult<Template>> {
    return this.http.get<SearchResult<Template>>(`${this.baseUrl}/templates`, {params: SearchHttpParams.build(params)});
  }
}
