import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {Page} from '../model/page';
import {PageLinkSearchParams} from '../model/page-link-search-params';
import {PageLink} from '../model/page-link';
import {environment} from 'environments/environment';

@Injectable()
export class PageLinkLibService {
  protected baseUrl = `${environment.terminologyApi}/page-links`;

  public constructor(protected http: HttpClient) { }

  public search(params: PageLinkSearchParams = {}): Observable<SearchResult<PageLink>> {
    return this.http.get<SearchResult<Page>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
