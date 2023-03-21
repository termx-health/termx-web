import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {Designation, DesignationSearchParams} from '../../designation';
import {environment} from 'environments/environment';

@Injectable()
export class DesignationLibService {
  protected baseUrl = `${environment.terminologyApi}/ts/designations`;

  public constructor(protected http: HttpClient) {}

  public search(params: DesignationSearchParams = {}): Observable<SearchResult<Designation>> {
    return this.http.get<SearchResult<Designation>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
