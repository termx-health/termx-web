import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {StructureDefinition} from '../../_lib';
import {environment} from 'environments/environment';
import {SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {TransformationDefinition} from 'term-web/modeler/transformer/services/transformation-definition';
import {TransformationDefinitionQueryParams} from 'term-web/modeler/transformer/services/transformation-definition-query.params';

@Injectable()
export class TransformationDefinitionService {
  protected baseUrl = `${environment.termxApi}/transformation-definitions`;

  public constructor(protected http: HttpClient) {}

  public load(id: number): Observable<TransformationDefinition> {
    return this.http.get<TransformationDefinition>(`${this.baseUrl}/${id}`);
  }

  public search(params: TransformationDefinitionQueryParams): Observable<SearchResult<TransformationDefinition>> {
    return this.http.get<SearchResult<TransformationDefinition>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public transform(source: string, def: StructureDefinition): Observable<TransformationResult> {
    return this.http.post<TransformationResult>(`${this.baseUrl}/transform`, {definition: def, source: source});
  }

  public save(def: TransformationDefinition): Observable<any> {
    if (def.id) {
      return this.http.put(`${this.baseUrl}/${def.id}`, def);
    }
    return this.http.post(`${this.baseUrl}`, def);
  }

}

export class TransformationResult {
  public result?: string;
  public error?: string;
}
