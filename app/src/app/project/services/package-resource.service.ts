import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PackageResource, PackageResourceLibService} from 'terminology-lib/project';

@Injectable()
export class PackageResourceService extends PackageResourceLibService {
  public update(id: number, versionId: number, resource: PackageResource): Observable<PackageResource> {
    return this.http.put<PackageResource>(`${this.baseUrl}/${id}`, {versionId: versionId, resource: resource});
  }
}
