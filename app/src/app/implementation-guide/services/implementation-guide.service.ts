import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {
  ImplementationGuideLibService,
  ImplementationGuideTransactionRequest,
  ImplementationGuideVersion,
  ImplementationGuideVersionGroup, ImplementationGuideVersionResource
} from 'term-web/implementation-guide/_lib';

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

  public saveVersion(ig: string, version: ImplementationGuideVersion): Observable<ImplementationGuideVersion> {
    if (version.id && version.version) {
      return this.http.put(`${this.baseUrl}/${ig}/versions/${version.version}`, version);
    }
    return this.http.post(`${this.baseUrl}/${ig}/versions`, version);
  }

  public changeVersionStatus(ig: string, version: string, status: 'draft' | 'active' | 'retired'): Observable<void> {
    if (status === 'draft') {
      return this.http.post<void>(`${this.baseUrl}/${ig}/versions/${version}/draft`, {});
    }
    if (status === 'active') {
      return this.http.post<void>(`${this.baseUrl}/${ig}/versions/${version}/activate`, {});
    }
    if (status === 'retired') {
      return this.http.post<void>(`${this.baseUrl}/${ig}/versions/${version}/retire`, {});
    }
    return of();
  }

  public deleteVersion(ig: string, version: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${ig}/versions/${version}`);
  }

  public saveVersionGroups(ig: string, version: string, groups: ImplementationGuideVersionGroup[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${ig}/versions/${version}/groups`, groups);
  }

  public saveVersionResource(ig: string, version: string, resources: ImplementationGuideVersionResource[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${ig}/versions/${version}/resources`, resources);
  }
}
