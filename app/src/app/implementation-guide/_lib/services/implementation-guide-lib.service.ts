import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {
  ImplementationGuideVersion,
  ImplementationGuideSearchParams,
  ImplementationGuideVersionSearchParams,
  ImplementationGuideVersionResource, ImplementationGuideVersionPage
} from 'term-web/implementation-guide/_lib';
import {ImplementationGuide} from '../model/implementation-guide';
import {Provenance} from 'term-web/sys/_lib';

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

  public loadVersionResources(ig: string, version: string): Observable<ImplementationGuideVersionResource[]> {
    return this.http.get<ImplementationGuideVersionResource[]>(`${this.baseUrl}/${ig}/versions/${version}/resources`);
  }

  public loadVersionPages(ig: string, version: string): Observable<ImplementationGuideVersionPage[]> {
    return this.http.get<ImplementationGuideVersionPage[]>(`${this.baseUrl}/${ig}/versions/${version}/pages`);
  }

  public searchVersions(ig: string, params: ImplementationGuideVersionSearchParams = {}): Observable<SearchResult<ImplementationGuideVersion>> {
    return this.http.get<SearchResult<ImplementationGuideVersion>>(`${this.baseUrl}/${ig}/versions`, {params: SearchHttpParams.build(params)});
  }

  public loadProvenances(ig: string, version: string): Observable<Provenance[]> {
    return this.http.get<Provenance[]>(`${this.baseUrl}/${ig}/provenances`, {params: SearchHttpParams.build({version})});
  }
}
