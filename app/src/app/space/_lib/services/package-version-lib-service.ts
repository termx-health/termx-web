import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {PackageVersion} from '../model/package';

@Injectable()
export class PackageVersionLibService {
  protected baseUrl = `${environment.terminologyApi}/package-versions`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<PackageVersion> {
    return this.http.get<PackageVersion>(`${this.baseUrl}/${id}`);
  }
}
