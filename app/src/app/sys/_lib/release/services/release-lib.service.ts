import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Provenance} from 'term-web/sys/_lib/provenance/model/provenance';
import {Release} from 'term-web/sys/_lib/release/model/release';
import {ReleaseResource} from 'term-web/sys/_lib/release/model/release-resource';
import {ReleaseSearchParams} from 'term-web/sys/_lib/release/model/release-search-params';
import {JobLibService} from 'term-web/sys/_lib/job/services/job-lib.service';

@Injectable()
export class ReleaseLibService {
  protected http = inject(HttpClient);
  protected jobService = inject(JobLibService);

  protected baseUrl = `${environment.termxApi}/releases`;

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

  public loadNotes(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${id}/notes`);
  }

  public downloadFile(id: number, fileName: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/notes/${fileName}`, { responseType: 'blob' });
  }
}
