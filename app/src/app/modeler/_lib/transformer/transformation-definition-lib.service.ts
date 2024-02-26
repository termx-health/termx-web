import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Bundle} from 'fhir/model/bundle';
import {Observable} from 'rxjs';
import {TransformationDefinition} from 'term-web/modeler/_lib/transformer/transformation-definition';
import {TransformationDefinitionQueryParams} from 'term-web/modeler/_lib/transformer/transformation-definition-query.params';

@Injectable()
export class TransformationDefinitionLibService {
  protected baseUrl = `${environment.termxApi}/transformation-definitions`;

  public constructor(protected http: HttpClient) {}

  public load(id: number): Observable<TransformationDefinition> {
    return this.http.get<TransformationDefinition>(`${this.baseUrl}/${id}`);
  }

  public search(params: TransformationDefinitionQueryParams): Observable<SearchResult<TransformationDefinition>> {
    return this.http.get<SearchResult<TransformationDefinition>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public baseResources(): Observable<Bundle> {
    return this.http.get<Bundle>(`${this.baseUrl}/base-resources`);
  }
}
