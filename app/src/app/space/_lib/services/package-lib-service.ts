import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {Package, PackageVersion} from '../model/package';

@Injectable()
export class PackageLibService {
  protected baseUrl = `${environment.terminologyApi}/packages`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<Package> {
    return this.http.get<Package>(`${this.baseUrl}/${id}`);
  }

  public loadVersions(id: number): Observable<PackageVersion[]> {
    return this.http.get<PackageVersion[]>(`${this.baseUrl}/${id}/versions`);
  }
}
