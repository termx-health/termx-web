import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {PageComment} from '../models/page-comment';
import {PageCommentSearchParams} from '../models/page-comment-search-params';

@Injectable()
export class PageCommentLibService {
  protected baseUrl = `${environment.termxApi}/page-comments`;

  public constructor(protected http: HttpClient) { }

  public search(params: PageCommentSearchParams = {}): Observable<SearchResult<PageComment>> {
    return this.http.get<SearchResult<PageComment>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
