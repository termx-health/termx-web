import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {MapSetVersion} from '../model/map-set-version';
import {MapSetEntityVersionSearchParams} from '../model/map-set-entity-version-search-params';
import {MapSetEntityVersion} from '../model/map-set-entity-version';
import {MapSetAssociation} from '../model/map-set-association';
import {MapSetAssociationSearchParams} from '../model/map-set-association-search-params';
import {MapSet} from '../model/map-set';
import {MapSetSearchParams} from '../model/map-set-search-params';
import {MapSetVersionSearchParams} from '../model/map-set-version-search-params';


@Injectable()
export class MapSetLibService {
  protected baseUrl = `${environment.terminologyApi}/ts/map-sets`;

  public constructor(protected http: HttpClient) { }

  public load(mapSetId: string): Observable<MapSet> {
    return this.http.get<MapSet>(`${this.baseUrl}/${mapSetId}`);
  }

  public search(params: MapSetSearchParams = {}): Observable<SearchResult<MapSet>> {
    return this.http.get<SearchResult<MapSet>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }

  public loadVersion(mapSetId: string, versionId: string): Observable<MapSetVersion> {
    return this.http.get<MapSetVersion>(`${this.baseUrl}/${mapSetId}/versions/${versionId}`);
  }

  public searchVersions(mapSetId: string, params: MapSetVersionSearchParams = {}): Observable<SearchResult<MapSetVersion>> {
    return this.http.get<SearchResult<MapSetVersion>>(`${this.baseUrl}/${mapSetId}/versions`, {params: SearchHttpParams.build(params)});
  }

  public searchEntityVersions(mapSetId: string, params: MapSetEntityVersionSearchParams): Observable<SearchResult<MapSetEntityVersion>> {
    return this.http.get<SearchResult<MapSetEntityVersion>>(`${this.baseUrl}/${mapSetId}/entity-versions`, {params: SearchHttpParams.build(params)});
  }

  public loadAssociation(mapSetId: string, associationId: number): Observable<MapSetAssociation> {
    return this.http.get<MapSetAssociation>(`${this.baseUrl}/${mapSetId}/associations/${associationId}`);
  }

  public searchAssociations(mapSetId: string, params: MapSetAssociationSearchParams = {}): Observable<SearchResult<MapSetAssociation>> {
    return this.http.get<SearchResult<MapSetAssociation>>(`${this.baseUrl}/${mapSetId}/associations`, {params: SearchHttpParams.build(params)});
  }
}
