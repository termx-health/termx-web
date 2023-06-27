import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {MapSetEntityVersion} from '../model/map-set-entity-version';

@Injectable()
export class MapSetEntityVersionLibService {
  protected baseUrl = `${environment.termxApi}/ts/map-set-entity-versions`;

  public constructor(protected http: HttpClient) { }

  public load(mapSetEntityVersionId: number): Observable<MapSetEntityVersion> {
    return this.http.get<MapSetEntityVersion>(`${this.baseUrl}/${mapSetEntityVersionId}`);
  }
}
