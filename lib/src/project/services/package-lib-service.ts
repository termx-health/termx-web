import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Package, PackageVersion} from '../model/package';

@Injectable()
export class PackageLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/packages`;
  }

  public load(id: number): Observable<Package> {
    return this.http.get<Package>(`${this.baseUrl}/${id}`);
  }

  public loadVersions(id: number): Observable<PackageVersion[]> {
    return this.http.get<PackageVersion[]>(`${this.baseUrl}/${id}/versions`);
  }
}
