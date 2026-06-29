import {HttpParams, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {isDefined} from '@termx-health/core-util';
import {map, Observable} from 'rxjs';
import {Page, PageAttachment, PageContent, PageLibService} from 'term-web/wiki/_lib';

@Injectable()
export class PageService extends PageLibService {
  // export

  public exportWiki(format: 'pdf' | 'html', spaceId: number, pageId?: number): Observable<HttpResponse<Blob>> {
    let params = new HttpParams().set('spaceId', spaceId);
    if (isDefined(pageId)) {
      params = params.set('pageId', pageId);
    }
    return this.http.get(`${this.baseUrl}/wiki-export/export-${format}`, {params, responseType: 'blob', observe: 'response'});
  }

  // page

  public savePage(page: Page, pageContent: PageContent): Observable<Page> {
    if (isDefined(page.id)) {
      return this.http.put(`${this.baseUrl}/pages/${page.id}`, {page: page, content: pageContent});
    }
    return this.http.post(`${this.baseUrl}/pages`, {page: page, content: pageContent});
  }

  public deletePage(pageId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/pages/${pageId}`);
  }


  // contents

  public savePageContent(content: PageContent, pageId: number): Observable<PageContent> {
    if (isDefined(content.id)) {
      return this.http.put(`${this.baseUrl}/pages/${pageId}/contents/${content.id}`, content);
    }
    return this.http.post(`${this.baseUrl}/pages/${pageId}/contents`, content);
  }


  // attachments

  public uploadAttachment(pageId: number, content: Blob): Observable<PageAttachment> {
    const fd = new FormData();
    fd.append('file', content);
    return this.http.post<{[k: string]: PageAttachment}>(`${this.baseUrl}/pages/${pageId}/files`, fd).pipe(map(resp => resp['file']));
  }

  public deleteAttachment(pageId: number, fileName: string): Observable<void> {
    return this.http.delete(`${this.baseUrl}/pages/${pageId}/files/${encodeURIComponent(fileName)}`).pipe(map(() => null));
  }
}
