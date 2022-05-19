import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {Concept} from '../../concept';
import {ValueSet} from '../model/value-set';
import {ValueSetVersion} from '../model/value-set-version';
import {ValueSetSearchParams} from '../model/value-set-search-params';
import {Designation} from '../../designation';

@Injectable()
export class ValueSetLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/value-sets`;
  }

  public load(valueSetId: string): Observable<ValueSet> {
    return this.http.get<ValueSet>(`${this.baseUrl}/${valueSetId}`);
  }

  public loadVersion(valueSetId: string, version: string): Observable<ValueSetVersion> {
    return this.http.get<ValueSetVersion>(`${this.baseUrl}/${valueSetId}/versions/${version}`);
  }

  public loadVersions(valueSetId: string): Observable<ValueSetVersion[]> {
    return this.http.get<ValueSetVersion[]>(`${this.baseUrl}/${valueSetId}/versions`);
  }

  public loadConcepts(valueSetId: string, versionVersion: string): Observable<Concept[]> {
    return this.http.get<Concept[]>(`${this.baseUrl}/${valueSetId}/versions/${versionVersion}/concepts`);
  }

  public loadDesignations(valueSetId: string, versionVersion: string): Observable<Designation[]> {
    return this.http.get<Designation[]>(`${this.baseUrl}/${valueSetId}/versions/${versionVersion}/designations`);
  }

  public search(params: ValueSetSearchParams = {}): Observable<SearchResult<ValueSet>> {
    return this.http.get<SearchResult<ValueSet>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
