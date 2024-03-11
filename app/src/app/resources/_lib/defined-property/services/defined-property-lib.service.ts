import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {DefinedProperty} from '../model/defined-property';
import {DefinedPropertySearchParams} from '../model/defined-property-search-params';

@Injectable()
export class DefinedPropertyLibService {
  protected baseUrl = `${environment.termxApi}/ts/defined-properties`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<DefinedProperty> {
    return this.http.get<DefinedProperty>(`${this.baseUrl}/${id}`);
  }

  public search(params: DefinedPropertySearchParams = {}): Observable<SearchResult<DefinedProperty>> {
    return this.http.get<SearchResult<DefinedProperty>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
