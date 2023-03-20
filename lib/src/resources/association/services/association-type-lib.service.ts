import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API_URL} from '../../../terminology-lib.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {AssociationTypeSearchParams} from '../model/association-type-search-params';
import {AssociationType} from '../model/association-type';

@Injectable()
export class AssociationTypeLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API_URL) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/association-types`;
  }

  public load(code: string): Observable<AssociationType> {
    return this.http.get<AssociationType>(`${this.baseUrl}/${code}`);
  }

  public search(params: AssociationTypeSearchParams = {}): Observable<SearchResult<AssociationType>> {
    return this.http.get<SearchResult<AssociationType>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
