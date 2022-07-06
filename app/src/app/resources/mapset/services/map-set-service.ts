import {MapSet, MapSetAssociation, MapSetLibService, MapSetVersion} from 'terminology-lib/resources';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';


@Injectable()
export class MapSetService extends MapSetLibService {

  public save(ms: MapSet): Observable<MapSet> {
    return this.http.post(this.baseUrl, ms);
  }

  public saveVersion(mapSetId: string, version: MapSetVersion): Observable<MapSetVersion> {
    if (version.id && version.version) {
      return this.http.put(`${this.baseUrl}/${mapSetId}/versions/${version.id}`, version);
    }
    return this.http.post(`${this.baseUrl}/${mapSetId}/versions`, version);
  }

  public activateVersion(mapSetId: string, version: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${mapSetId}/versions/${version}/activate`, {});
  }

  public retireVersion(mapSetId: string, version: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${mapSetId}/versions/${version}/retire`, {});
  }

  public saveAssociation(mapSetId: string, association: MapSetAssociation): Observable<MapSetAssociation> {
    if (association.id) {
      return this.http.put(`${this.baseUrl}/${mapSetId}/associations/${association.id}`, association);
    }
    return this.http.post(`${this.baseUrl}/${mapSetId}/associations`, association);
  }
}