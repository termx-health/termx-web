import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Provenance, Release, ReleaseResource, ReleaseSearchParams} from 'term-web/sys/_lib';

@Injectable()
export class ReleaseLibService {
  protected baseUrl = `${environment.termxApi}/releases`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<Release> {
    return this.http.get<Release>(`${this.baseUrl}/${id}`);
  }

  public search(params: ReleaseSearchParams): Observable<SearchResult<Release>> {
    return this.http.get<SearchResult<Release>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public loadResources(id: number): Observable<ReleaseResource[]> {
    return this.http.get<ReleaseResource[]>(`${this.baseUrl}/${id}/resources`);
  }

  public loadProvenances(id: number): Observable<Provenance[]> {
    return this.http.get<Provenance[]>(`${this.baseUrl}/${id}/provenances`);
  }
}
