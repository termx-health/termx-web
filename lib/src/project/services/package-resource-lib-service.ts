import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PackageResource} from '../model/package';
import {SearchHttpParams} from '@kodality-web/core-util';

@Injectable()
export class PackageResourceLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/package-resources`;
  }

  public loadAll(projectCode: string, packageCode: string, version: string): Observable<PackageResource[]> {
    const params = {projectCode: projectCode, packageCode: packageCode, version: version};
    return this.http.get<PackageResource[]>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
