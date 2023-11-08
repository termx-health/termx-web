import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {ImplementationGuideVersion, ImplementationGuideSearchParams} from 'term-web/implementation-guide/_lib';
import {ImplementationGuide} from '../model/implementation-guide';

@Injectable()
export class ImplementationGuideLibService {
  protected baseUrl = `${environment.termxApi}/implementation-guides`;

  public constructor(protected http: HttpClient) {}

  public load(id: string): Observable<ImplementationGuide> {
    return this.http.get<ImplementationGuide>(`${this.baseUrl}/${id}`);
  }

  public search(params: ImplementationGuideSearchParams = {}): Observable<SearchResult<ImplementationGuide>> {
    return this.http.get<SearchResult<ImplementationGuide>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public loadVersion(ig: string, version: string): Observable<ImplementationGuideVersion> {
    return this.http.get<ImplementationGuideVersion>(`${this.baseUrl}/${ig}/versions/${version}`);
  }
}
