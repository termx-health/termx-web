import {Injectable} from '@angular/core';
import {PageCommentLibService} from '../../_lib';
import {Observable} from 'rxjs';
import {isDefined} from '@kodality-web/core-util';
import {PageComment} from 'term-web/wiki/_lib';

@Injectable()
export class PageCommentService extends PageCommentLibService {
  public save(comment: PageComment): Observable<PageComment> {
    if (isDefined(comment.id)) {
      return this.http.put(`${this.baseUrl}/${comment.id}`, comment);
    }
    return this.http.post(`${this.baseUrl}`, comment);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  public reply(parentId: number, comment: Omit<PageComment, 'parentId'>): Observable<PageComment> {
    return this.save({...comment, parentId: parentId});
  }

  public resolve(id: number): Observable<PageComment> {
    return this.http.post(`${this.baseUrl}/${id}/resolve`, null);
  }
}
