import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {PageComment} from 'term-web/wiki/_lib/page/models/page-comment';
import {PageCommentSearchParams} from 'term-web/wiki/_lib/page/models/page-comment-search-params';

@Injectable()
export class PageCommentLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/page-comments`;

  public search(params: PageCommentSearchParams = {}): Observable<SearchResult<PageComment>> {
    return this.http.get<SearchResult<PageComment>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
