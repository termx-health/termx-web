import {Injectable} from '@angular/core';
import {Page, PageContent, PageLibService} from 'term-web/thesaurus/_lib';
import {Observable} from 'rxjs';
import {isDefined} from '@kodality-web/core-util';

@Injectable()
export class PageService extends PageLibService {

  public savePage(page: Page, pageContent: PageContent): Observable<Page> {
    if (isDefined(page.id)) {
      return this.http.put(`${this.baseUrl}/pages/${page.id}`, {page: page, content: pageContent});
    }
    return this.http.post(`${this.baseUrl}/pages`, {page: page, content: pageContent});
  }

  public savePageContent(content: PageContent, pageId: number): Observable<PageContent> {
    if (isDefined(content.id)) {
      return this.http.put(`${this.baseUrl}/pages/${pageId}/contents/${content.id}`, content);
    }
    return this.http.post(`${this.baseUrl}/pages/${pageId}/contents`, content);
  }
  //
  // public movePage(pageId: number, req: {
  //   parentId?: number,
  //   siblingId?: number
  //   action?: string
  // }): Observable<PageContent> {
  //   return this.http.post(`${this.baseUrl}/pages/${pageId}/move`, req);
  // }
}
