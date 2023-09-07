import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Space} from '../model/space';
import {Package} from '../model/package';
import {SpaceSearchParams} from 'term-web/space/_lib';
import {SpaceDiff} from '../model/space-diff';

@Injectable()
export class SpaceLibService {
  protected baseUrl = `${environment.termxApi}/spaces`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<Space> {
    return this.http.get<Space>(`${this.baseUrl}/${id}`);
  }

  public loadPackages(id: number): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.baseUrl}/${id}/packages`);
  }

  public search(params: SpaceSearchParams): Observable<SearchResult<Space>> {
    return this.http.get<SearchResult<Space>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public overview(request: {spaceCode: string, packageCode: string, version: string}): Observable<{content: string}> {
    return this.http.post<{content: string}>(`${this.baseUrl}/overview`, request);
  }

  public diff(request: {spaceCode: string, packageCode: string, version: string}): Observable<SpaceDiff> {
    return this.http.post<SpaceDiff>(`${this.baseUrl}/diff`, request);
  }

}
