import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {PackageResource} from '../model/package';

@Injectable()
export class PackageResourceLibService {
  protected baseUrl = `${environment.terminologyApi}/package-resources`;

  public constructor(protected http: HttpClient) { }

  public loadAll(spaceCode: string, packageCode: string, version: string): Observable<PackageResource[]> {
    const params = {spaceCode: spaceCode, packageCode: packageCode, version: version};
    return this.http.get<PackageResource[]>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
