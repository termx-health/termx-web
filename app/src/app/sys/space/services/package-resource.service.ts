import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {JobLogResponse} from 'app/src/app/sys/_lib';
import {PackageResource, PackageResourceLibService} from '../../_lib/space';

@Injectable()
export class PackageResourceService extends PackageResourceLibService {
  public update(id: number, versionId: number, resource: PackageResource): Observable<PackageResource> {
    return this.http.put<PackageResource>(`${this.baseUrl}/${id}`, {versionId: versionId, resource: resource});
  }

  public sync(id: number, type: 'local' | 'external', resourceVersion?: string): Observable<JobLogResponse> {
    return this.http.post<JobLogResponse>(`${this.baseUrl}/${id}/sync`, {type: type, resourceVersion: resourceVersion});
  }

  public changeServer(ids: number[], server: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/change-server`, {resourceIds: ids, terminologyServer: server});
  }
}
