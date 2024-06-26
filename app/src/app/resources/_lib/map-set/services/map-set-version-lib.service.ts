import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {MapSetVersion} from 'term-web/resources/_lib';

@Injectable()
export class MapSetVersionLibService {
  protected baseUrl = `${environment.termxApi}/ts/map-set-versions`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<MapSetVersion> {
    return this.http.get<MapSetVersion>(`${this.baseUrl}/${id}`);
  }
}
