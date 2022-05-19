import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {MapSet} from '../model/map-set';
import {MapSetSearchParams} from '../model/map-set-search-params';


@Injectable()
export class MapSetLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/map-sets`;
  }

  public load(mapSetId: string): Observable<MapSet> {
    return this.http.get<MapSet>(`${this.baseUrl}/${mapSetId}`);
  }


  public search(params: MapSetSearchParams = {}): Observable<SearchResult<MapSet>> {
    return this.http.get<SearchResult<MapSet>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
