import {MapSetLibService} from 'terminology-lib/resources/mapset/services/map-set-lib.service';
import {Injectable} from '@angular/core';
import {MapSet} from 'terminology-lib/resources';
import {Observable} from 'rxjs';

@Injectable()
export class MapSetService extends MapSetLibService {
  public save(ms: MapSet): Observable<MapSet> {
    return this.http.post(this.baseUrl, ms);
  }
}