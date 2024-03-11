import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {MapSetAssociation, MapSetAutomapRequest, MapSetLibService, MapSetTransactionRequest, MapSetVersion} from 'term-web/resources/_lib';
import {JobLogResponse} from 'term-web/sys/_lib';


@Injectable()
export class MapSetService extends MapSetLibService {

  public saveMapSet(request: MapSetTransactionRequest): any {
    return this.http.post<void>(`${this.baseUrl}/transaction`, request);
  }

  public changeMapSetId(currentId: string, newId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${currentId}/change-id`, {id: newId});
  }

  public delete(mapSetId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${mapSetId}`);
  }

  public saveMapSetVersion(mapSetId: string, version: MapSetVersion): Observable<MapSetVersion> {
    if (version.id && version.version) {
      return this.http.put(`${this.baseUrl}/${mapSetId}/versions/${version.version}`, version);
    }
    return this.http.post(`${this.baseUrl}/${mapSetId}/versions`, version);
  }

  public changeMapSetVersionStatus(mapSetId: string, version: string, status: 'draft' | 'active' | 'retired'): Observable<void> {
    if (status === 'draft') {
      return this.http.post<void>(`${this.baseUrl}/${mapSetId}/versions/${version}/draft`, {});
    }
    if (status === 'active') {
      return this.http.post<void>(`${this.baseUrl}/${mapSetId}/versions/${version}/activate`, {});
    }
    if (status === 'retired') {
      return this.http.post<void>(`${this.baseUrl}/${mapSetId}/versions/${version}/retire`, {});
    }
    return of();
  }

  public deleteMapSetVersion(mapSetId: string, version: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${mapSetId}/versions/${version}`);
  }

  public saveAssociation(mapSetId: string, version: string, association: MapSetAssociation): Observable<MapSetAssociation> {
    if (association.id) {
      return this.http.put(`${this.baseUrl}/${mapSetId}/versions/${version}/associations/${association.id}`, association);
    }
    return this.http.post(`${this.baseUrl}/${mapSetId}/versions/${version}/associations`, association);
  }


  public saveAssociations(mapSetId: string, version: string, associations: MapSetAssociation[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${mapSetId}/versions/${version}/associations-batch`, {batch: associations});
  }

  public verifyAssociations(mapSetId: string, version: string, verifiedIds: number[], unVerifiedIds: number[]): Observable<MapSetAssociation> {
    return this.http.post(`${this.baseUrl}/${mapSetId}/versions/${version}/associations/verify`, {verifiedIds: verifiedIds, unVerifiedIds: unVerifiedIds});
  }

  public unmapAssociations(mapSetId: string, version: string, ids: number[]): Observable<MapSetAssociation> {
    return this.http.post(`${this.baseUrl}/${mapSetId}/versions/${version}/associations/unmap`, {ids: ids});
  }

  public automapAssociations(mapSetId: string, version: string, request: MapSetAutomapRequest): Observable<JobLogResponse> {
    return this.http.post<JobLogResponse>(`${this.baseUrl}/${mapSetId}/versions/${version}/associations/automap`, request);
  }

  public deletePropertyUsages(mapSetId: string, propertyId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${mapSetId}/properties/${propertyId}/delete-usages`, {});
  }
}
