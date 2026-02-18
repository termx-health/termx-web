import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Page} from 'term-web/wiki/_lib/page/models/page';
import {PageLink} from 'term-web/wiki/_lib/page/models/page-link';
import {PageLinkSearchParams} from 'term-web/wiki/_lib/page/models/page-link-search-params';

@Injectable()
export class PageLinkLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/page-links`;

  public search(params: PageLinkSearchParams = {}): Observable<SearchResult<PageLink>> {
    return this.http.get<SearchResult<Page>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
