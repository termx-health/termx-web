import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Template} from '../model/template';
import {TemplateSearchParams} from '../model/template-search-params';

@Injectable()
export class TemplateLibService {
  protected baseUrl = environment.terminologyApi;

  public constructor(protected http: HttpClient) { }

  public loadTemplate(id: number): Observable<Template> {
    return this.http.get<Template>(`${this.baseUrl}/templates/${id}`);
  }

  public searchTemplates(params: TemplateSearchParams = {}): Observable<SearchResult<Template>> {
    return this.http.get<SearchResult<Template>>(`${this.baseUrl}/templates`, {params: SearchHttpParams.build(params)});
  }
}