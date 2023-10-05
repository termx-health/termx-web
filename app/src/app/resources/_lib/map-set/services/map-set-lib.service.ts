import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {MapSetVersion} from '../model/map-set-version';
import {MapSetAssociation} from '../model/map-set-association';
import {MapSetAssociationSearchParams} from '../model/map-set-association-search-params';
import {MapSet} from '../model/map-set';
import {MapSetSearchParams} from '../model/map-set-search-params';
import {MapSetVersionSearchParams} from '../model/map-set-version-search-params';
import {JobLogResponse, Provenance} from 'term-web/sys/_lib';
import {MapSetConcept, MapSetConceptSearchParams} from 'term-web/resources/_lib';


@Injectable()
export class MapSetLibService {
  protected baseUrl = `${environment.termxApi}/ts/map-sets`;

  public constructor(protected http: HttpClient) { }

  public load(mapSetId: string, decorate?: boolean): Observable<MapSet> {
    return this.http.get<MapSet>(`${this.baseUrl}/${mapSetId}?decorate=${decorate}`);
  }

  public search(params: MapSetSearchParams = {}): Observable<SearchResult<MapSet>> {
    return this.http.get<SearchResult<MapSet>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public loadVersion(mapSetId: string, version: string): Observable<MapSetVersion> {
    return this.http.get<MapSetVersion>(`${this.baseUrl}/${mapSetId}/versions/${version}`);
  }

  public searchVersions(mapSetId: string, params: MapSetVersionSearchParams = {}): Observable<SearchResult<MapSetVersion>> {
    return this.http.get<SearchResult<MapSetVersion>>(`${this.baseUrl}/${mapSetId}/versions`, {params: SearchHttpParams.build(params)});
  }

  public reloadStatistics(mapSetId: string, version: string): Observable<JobLogResponse> {
    return this.http.post<JobLogResponse>(`${this.baseUrl}/${mapSetId}/versions/${version}/reload-statistics-async`, {});
  }

  public searchConcepts(mapSetId: string, version: string, params: MapSetConceptSearchParams = {}): Observable<SearchResult<MapSetConcept>> {
    return this.http.get<SearchResult<MapSetConcept>>(`${this.baseUrl}/${mapSetId}/versions/${version}/concepts`, {params: SearchHttpParams.build(params)});
  }

  public loadAssociation(mapSetId: string, associationId: number): Observable<MapSetAssociation> {
    return this.http.get<MapSetAssociation>(`${this.baseUrl}/${mapSetId}/associations/${associationId}`);
  }

  public searchAssociations(mapSetId: string, params: MapSetAssociationSearchParams = {}): Observable<SearchResult<MapSetAssociation>> {
    return this.http.get<SearchResult<MapSetAssociation>>(`${this.baseUrl}/${mapSetId}/associations`, {params: SearchHttpParams.build(params)});
  }

  public loadProvenances(mapSet: string, version: string): Observable<Provenance[]> {
    return this.http.get<Provenance[]>(`${this.baseUrl}/${mapSet}/provenances`, {params: SearchHttpParams.build({version})});
  }
}
