import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {PackageResource} from 'term-web/sys/_lib/space/model/package';

@Injectable()
export class PackageResourceLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/package-resources`;

  public loadAll(spaceId: number, packageCode: string, version: string): Observable<PackageResource[]> {
    return this.http.get<PackageResource[]>(`${this.baseUrl}`, {params: SearchHttpParams.build({spaceId, packageCode, version})});
  }
}
