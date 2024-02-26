import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Page} from '../models/page';
import {PageLink} from '../models/page-link';
import {PageLinkSearchParams} from '../models/page-link-search-params';

@Injectable()
export class PageLinkLibService {
  protected baseUrl = `${environment.termxApi}/page-links`;

  public constructor(protected http: HttpClient) { }

  public search(params: PageLinkSearchParams = {}): Observable<SearchResult<PageLink>> {
    return this.http.get<SearchResult<Page>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
