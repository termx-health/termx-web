import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {map, Observable} from 'rxjs';
import {Sequence} from '../models/sequence';
import {SequenceSearchParams} from '../models/sequence-search-params';

@Injectable()
export class SequenceLibService {
  protected baseUrl = `${environment.termxApi}/sequences`;

  public constructor(protected http: HttpClient) { }

  public nextValue(code: string): Observable<string> {
    return this.http.get<{value: string}>(`${this.baseUrl}/${encodeURIComponent(code)}/next`).pipe(map(r => r.value));
  }

  public load(id: number): Observable<Sequence> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  public search(params: SequenceSearchParams): Observable<SearchResult<Sequence>> {
    return this.http.get<SearchResult<Sequence>>(`${this.baseUrl}/`, {params: SearchHttpParams.build(params)});
  }
}
