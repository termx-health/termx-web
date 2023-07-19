import {Injectable} from '@angular/core';
import {Page, PageAttachment, PageContent, PageLibService} from 'term-web/wiki/_lib';
import {map, Observable} from 'rxjs';
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


  public uploadAttachment(pageId: number, content: Blob): Observable<PageAttachment> {
    const fd = new FormData();
    fd.append('file', content);
    return this.http.post<{[k: string]: PageAttachment}>(`${this.baseUrl}/pages/${pageId}/files`, fd).pipe(map(resp => resp['file']));
  }

  public deleteAttachment(pageId: number, fileName: string): Observable<void> {
    return this.http.delete(`${this.baseUrl}/pages/${pageId}/files/${encodeURIComponent(fileName)}`).pipe(map(() => null));
  }
}
