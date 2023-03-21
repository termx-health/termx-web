import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {AssociationType, AssociationTypeSearchParams} from '../../association';
import {environment} from 'environments/environment';

@Injectable()
export class AssociationTypeLibService {
  protected baseUrl = `${environment.terminologyApi}/ts/association-types`;

  public constructor(protected http: HttpClient) { }

  public load(code: string): Observable<AssociationType> {
    return this.http.get<AssociationType>(`${this.baseUrl}/${code}`);
  }

  public search(params: AssociationTypeSearchParams = {}): Observable<SearchResult<AssociationType>> {
    return this.http.get<SearchResult<AssociationType>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
