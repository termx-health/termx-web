import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Page} from '../model/page';
import {PageSearchParams} from '../model/page-search-params';
import {PageContentSearchParams} from '../model/page-content-search-params';
import {PageContent} from '../model/page-content';
import {PageRelationSearchParams} from '../model/page-relation-search-params';
import {PageRelation} from '../model/page-relation';

@Injectable()
export class PageLibService {
  protected baseUrl = environment.terminologyApi;

  public constructor(protected http: HttpClient) {  }

  public loadPage(id: number): Observable<Page> {
    return this.http.get<Page>(`${this.baseUrl}/pages/${id}`);
  }

  public searchPages(params: PageSearchParams = {}): Observable<SearchResult<Page>> {
    return this.http.get<SearchResult<Page>>(`${this.baseUrl}/pages`, {params: SearchHttpParams.build(params)});
  }

  public searchPageContents(params: PageContentSearchParams = {}): Observable<SearchResult<PageContent>> {
    return this.http.get<SearchResult<PageContent>>(`${this.baseUrl}/page-contents`, {params: SearchHttpParams.build(params)});
  }

  public searchPageRelations(params: PageRelationSearchParams = {}): Observable<SearchResult<PageRelation>> {
    return this.http.get<SearchResult<PageRelation>>(`${this.baseUrl}/page-relations`, {params: SearchHttpParams.build(params)});
  }

  public getPath(pageId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/pages/${pageId}/path`);
  }
}
