import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PackageVersion} from '../model/package';

@Injectable()
export class PackageVersionLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/package-versions`;
  }

  public load(id: number): Observable<PackageVersion> {
    return this.http.get<PackageVersion>(`${this.baseUrl}/${id}`);
  }
}
