import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Designation, DesignationSearchParams} from 'term-web/resources/_lib/designation';

@Injectable()
export class DesignationLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/ts/designations`;

  public search(params: DesignationSearchParams = {}): Observable<SearchResult<Designation>> {
    return this.http.get<SearchResult<Designation>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
