import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Ecosystem} from '../model/ecosystem';
import {EcosystemSearchParams} from '../model/ecosystem-search-params';

@Injectable()
export class EcosystemLibService {
  protected http = inject(HttpClient);
  protected baseUrl = `${environment.termxApi}/ecosystems`;

  public load(id: number): Observable<Ecosystem> {
    return this.http.get<Ecosystem>(`${this.baseUrl}/${id}`);
  }

  public search(params: EcosystemSearchParams): Observable<SearchResult<Ecosystem>> {
    return this.http.get<SearchResult<Ecosystem>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }
}
