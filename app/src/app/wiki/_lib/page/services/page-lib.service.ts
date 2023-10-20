import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Page, PageAttachment} from '../models/page';
import {PageSearchParams} from '../models/page-search-params';
import {PageContentSearchParams} from '../models/page-content-search-params';
import {PageContent} from '../models/page-content';
import {PageRelationSearchParams} from '../models/page-relation-search-params';
import {PageRelation} from '../models/page-relation';
import {PageTreeItem} from 'term-web/wiki/_lib/page/models/page-tree.item';
import {PageContentHistoryItem} from 'term-web/wiki/_lib/page/models/page-content-history-item';

@Injectable()
export class PageLibService {
  protected http = inject(HttpClient);
  protected baseUrl = environment.termxApi;

  // page

  public loadPage(id: number): Observable<Page> {
    return this.http.get<Page>(`${this.baseUrl}/pages/${id}`);
  }

  public searchPages(params: PageSearchParams = {}): Observable<SearchResult<Page>> {
    return this.http.get<SearchResult<Page>>(`${this.baseUrl}/pages`, {params: SearchHttpParams.build(params)});
  }

  public loadTree(spaceId: number): Observable<PageTreeItem[]> {
    return this.http.get<PageTreeItem[]>(`${this.baseUrl}/pages/tree?spaceId=${spaceId}`);
  }

  public getPath(pageId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/pages/${pageId}/path`);
  }


  // contents

  public searchPageContents(params: PageContentSearchParams = {}): Observable<SearchResult<PageContent>> {
    return this.http.get<SearchResult<PageContent>>(`${this.baseUrl}/page-contents`, {params: SearchHttpParams.build(params)});
  }


  public loadPageContentHistoryItem(pageId: number, contentId: number, id: number): Observable<PageContentHistoryItem> {
    return this.http.get<SearchResult<PageContentHistoryItem>>(`${this.baseUrl}/pages/${pageId}/contents/${contentId}/history`, {
      params: SearchHttpParams.build({
        ids: id,
        limit: 1
      })
    }).pipe(map(r => r.data[0]));
  }

  public loadPageContentHistory(pageId: number, contentId: number, opts: {offset: number, limit: number}): Observable<SearchResult<PageContentHistoryItem>> {
    return this.http.get<SearchResult<PageContentHistoryItem>>(`${this.baseUrl}/pages/${pageId}/contents/${contentId}/history`, {
      params: SearchHttpParams.build({
        offset: opts?.offset,
        limit: opts?.limit,
        sort: '-modified'
      })
    });
  }

  // relations

  public searchPageRelations(params: PageRelationSearchParams = {}): Observable<SearchResult<PageRelation>> {
    return this.http.get<SearchResult<PageRelation>>(`${this.baseUrl}/page-relations`, {params: SearchHttpParams.build(params)});
  }


  // attachments

  public loadAttachments(pageId: number): Observable<PageAttachment[]> {
    return this.http.get<PageAttachment[]>(`${this.baseUrl}/pages/${pageId}/files`);
  }
}
