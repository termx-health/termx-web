import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API_URL} from '../../../terminology-lib.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {Designation} from '../model/designation';
import {DesignationSearchParams} from '../model/designation-search-params';

@Injectable()
export class DesignationLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API_URL) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/designations`;
  }

  public search(params: DesignationSearchParams = {}): Observable<SearchResult<Designation>> {
    return this.http.get<SearchResult<Designation>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
