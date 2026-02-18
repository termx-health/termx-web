import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Package, PackageVersion} from 'term-web/sys/_lib/space/model/package';

@Injectable()
export class PackageLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/spaces`;

  public load(spaceId: number, id: number): Observable<Package> {
    return this.http.get<Package>(`${this.baseUrl}/${spaceId}/packages/${id}`);
  }

  public loadVersions(spaceId: number, id: number): Observable<PackageVersion[]> {
    return this.http.get<PackageVersion[]>(`${this.baseUrl}/${spaceId}/packages/${id}/versions`);
  }

  public loadVersion(spaceId: number, packageId: number, versionId: number): Observable<PackageVersion> {
    return this.http.get<PackageVersion>(`${this.baseUrl}/${spaceId}/packages/${packageId}/versions/${versionId}`);
  }
}
