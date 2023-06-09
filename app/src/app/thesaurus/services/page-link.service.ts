import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PageLink, PageLinkLibService} from '../_lib';

@Injectable()
export class PageLinkService extends PageLinkLibService {
  public moveLink(linkId: number, req: {
    parentLinkId?: number,
    siblingLinkId?: number
    action?: string
  }): Observable<PageLink[]> {
    return this.http.post<PageLink[]>(`${this.baseUrl}/${linkId}/move`, req);
  }
}
