import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {Page} from '../model/page';
import {PageSearchParams} from '../model/page-search-params';
import {PageContentSearchParams} from '../model/page-content-search-params';
import {PageContent} from '../model/page-content';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {StructureDefinition} from '../model/structure-definition';
import {StructureDefinitionSearchParams} from '../model/structure-definition-search-params';

@Injectable()
export class ThesaurusLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}`;
  }

  public loadPage(id: number): Observable<Page> {
    return this.http.get<Page>(`${this.baseUrl}/pages/${id}`);
  }

  public searchPages(params: PageSearchParams = {}): Observable<SearchResult<Page>> {
    return this.http.get<SearchResult<Page>>(`${this.baseUrl}/pages`, {params: SearchHttpParams.build(params)});
  }

  public searchPageContents(params: PageContentSearchParams = {}): Observable<SearchResult<PageContent>> {
    return this.http.get<SearchResult<PageContent>>(`${this.baseUrl}/page-contents`, {params: SearchHttpParams.build(params)});
  }

  public getPath(pageId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/pages/${pageId}/path`);
  }

  public loadStructureDefinition(id: number): Observable<StructureDefinition> {
    return this.http.get<StructureDefinition>(`${this.baseUrl}/structure-definitions/${id}`);
  }

  public searchStructureDefinitions(params: StructureDefinitionSearchParams = {}): Observable<SearchResult<StructureDefinition>> {
    return this.http.get<SearchResult<StructureDefinition>>(`${this.baseUrl}/structure-definitions`, {params: SearchHttpParams.build(params)});
  }
}
