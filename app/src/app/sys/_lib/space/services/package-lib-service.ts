import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'app/src/environments/environment';
import {Observable} from 'rxjs';
import {Package, PackageVersion} from '../model/package';

@Injectable()
export class PackageLibService {
  protected baseUrl = `${environment.termxApi}/spaces`;

  public constructor(protected http: HttpClient) { }

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
