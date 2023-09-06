import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {PageCommentSearchParams} from '../models/page-comment-search-params';
import {PageComment} from '../models/page-comment';

@Injectable()
export class PageCommentLibService {
  protected baseUrl = `${environment.termxApi}/page-comments`;

  public constructor(protected http: HttpClient) { }

  public search(params: PageCommentSearchParams = {}): Observable<SearchResult<PageComment>> {
    return this.http.get<SearchResult<PageComment>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
