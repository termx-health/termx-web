import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {Page} from '../models/page';
import {PageLinkSearchParams} from '../models/page-link-search-params';
import {PageLink} from '../models/page-link';
import {environment} from 'environments/environment';

@Injectable()
export class PageLinkLibService {
  protected baseUrl = `${environment.termxApi}/page-links`;

  public constructor(protected http: HttpClient) { }

  public search(params: PageLinkSearchParams = {}): Observable<SearchResult<PageLink>> {
    return this.http.get<SearchResult<Page>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
