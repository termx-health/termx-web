import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Designation, DesignationSearchParams} from '../../designation';

@Injectable()
export class DesignationLibService {
  protected baseUrl = `${environment.termxApi}/ts/designations`;

  public constructor(protected http: HttpClient) {}

  public search(params: DesignationSearchParams = {}): Observable<SearchResult<Designation>> {
    return this.http.get<SearchResult<Designation>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
