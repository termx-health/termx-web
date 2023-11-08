import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ImplementationGuideLibService, ImplementationGuideTransactionRequest} from 'term-web/implementation-guide/_lib';

@Injectable()
export class ImplementationGuideService extends ImplementationGuideLibService {
  public save(request: ImplementationGuideTransactionRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transaction`, request);
  }

  public changeId(currentId: string, newId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${currentId}/change-id`, {id: newId});
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
