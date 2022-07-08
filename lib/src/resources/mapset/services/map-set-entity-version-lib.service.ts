import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MapSetEntityVersion} from '../model/map-set-entity-version';

@Injectable()
export class MapSetEntityVersionLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/map-set-entity-versions`;
  }

  public load(mapSetEntityVersionId: number): Observable<MapSetEntityVersion> {
    return this.http.get<MapSetEntityVersion>(`${this.baseUrl}/${mapSetEntityVersionId}`);
  }
}