import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {Template} from '../model/template';
import {TemplateSearchParams} from '../model/template-search-params';

@Injectable()
export class TemplateLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}`;
  }

  public loadTemplate(id: number): Observable<Template> {
    return this.http.get<Template>(`${this.baseUrl}/templates/${id}`);
  }

  public searchTemplates(params: TemplateSearchParams = {}): Observable<SearchResult<Template>> {
    return this.http.get<SearchResult<Template>>(`${this.baseUrl}/templates`, {params: SearchHttpParams.build(params)});
  }
}
