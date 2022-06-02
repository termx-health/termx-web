import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {EntityProperty} from '../model/entity-property';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {EntityPropertySearchParams} from '../model/entity-property-search-params';

@Injectable()
export class EntityPropertyLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/entity-properties`;
  }

  public search(params: EntityPropertySearchParams = {}): Observable<SearchResult<EntityProperty>> {
    return this.http.get<SearchResult<EntityProperty>>(this.baseUrl, {params: SearchHttpParams.build(params)});
  }
}
