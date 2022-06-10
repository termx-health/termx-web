import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CodeSystemEntityVersion} from '../model/code-system-entity';
import {CodeSystemEntityVersionQueryParams} from '../model/code-system-entity-version-search-params';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';

@Injectable()
export class CodeSystemEntityVersionLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/code-system-entity-versions`;
  }

  public load(id: number): Observable<CodeSystemEntityVersion> {
    return this.http.get<CodeSystemEntityVersion>(`${this.baseUrl}/${id}`);
  }

  public search(params: CodeSystemEntityVersionQueryParams = {}): Observable<SearchResult<CodeSystemEntityVersion>> {
    return this.http.get<SearchResult<CodeSystemEntityVersion>>(`${this.baseUrl}`,  {params: SearchHttpParams.build(params)});
  }
}
