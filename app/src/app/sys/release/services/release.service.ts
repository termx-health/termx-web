import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Release, ReleaseLibService, ReleaseResource} from 'term-web/sys/_lib';
import {isDefined} from '@kodality-web/core-util';

@Injectable()
export class ReleaseService extends ReleaseLibService {

  public save(release: Release): Observable<Release> {
    if (isDefined(release.id)) {
      return this.http.put(`${this.baseUrl}/${release.id}`, release);
    }
    return this.http.post(`${this.baseUrl}`, release);
  }

  public saveResource(id: number, resource: ReleaseResource): Observable<any> {
    if (isDefined(resource.id)) {
      return this.http.put(`${this.baseUrl}/${id}/resources/${resource.id}`, resource);
    }
    return this.http.post(`${this.baseUrl}/${id}/resources`, resource);
  }

  public deleteResource(id: number, resourceId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/resources/${resourceId}`);
  }

  public changeStatus(id: number, status: 'draft' | 'active' | 'retired'): Observable<void> {
    if (status === 'draft') {
      return this.http.post<void>(`${this.baseUrl}/${id}/draft`, {});
    }
    if (status === 'active') {
      return this.http.post<void>(`${this.baseUrl}/${id}/activate`, {});
    }
    if (status === 'retired') {
      return this.http.post<void>(`${this.baseUrl}/${id}/retire`, {});
    }
    return of();
  }
}
