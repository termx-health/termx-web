import {Injectable} from '@angular/core';
import {HttpContext} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {TransformationDefinition, TransformationDefinitionResource} from 'term-web/modeler/_lib/transformer/transformation-definition';
import {StructureDefinition as FhirStructureDefinition} from 'fhir/model/structure-definition';
import {MuiSkipErrorHandler} from '@kodality-web/marina-ui';
import {TransformationDefinitionLibService} from 'term-web/modeler/_lib';

@Injectable()
export class TransformationDefinitionService extends TransformationDefinitionLibService{

  public transform(source: string, def: TransformationDefinition): Observable<TransformationResult> {
    return this.http.post<TransformationResult>(`${this.baseUrl}/transform`, {definition: def, source: source});
  }

  public transformResources(resources: TransformationDefinitionResource[]): Observable<FhirStructureDefinition[]> {
    return this.http.post<FhirStructureDefinition[]>(`${this.baseUrl}/transform-resources`, resources);
  }

  public transformResourceContent(resource: TransformationDefinitionResource, skipError = false): Observable<any> {
    return this.http.post(`${this.baseUrl}/transform-resource-content`, resource, {context: new HttpContext().set(MuiSkipErrorHandler, skipError)});
  }

  public composeFml(def: TransformationDefinition): Observable<string> {
    return this.http.post(`${this.baseUrl}/compose-fml`, def).pipe(map(r => r['fml']));
  }

  public generateFml(sm: object): Observable<string> {
    return this.http.post(`${this.baseUrl}/generate-fml`, {structureMap: JSON.stringify(sm)}).pipe(map(r => r['fml']));
  }

  public parseFml(fml: string): Observable<{json: string, error: string}> {
    return this.http.post(`${this.baseUrl}/parse-fml`, {fml}).pipe(map(r => r as {json: string, error: string}));
  }

  public generateInput(resource: TransformationDefinitionResource): Observable<string> {
    return this.http.post(`${this.baseUrl}/generate-input`, {resource}).pipe(map(r => r['resource']));
  }

  public save(def: TransformationDefinition): Observable<TransformationDefinition> {
    if (def.id) {
      return this.http.put<TransformationDefinition>(`${this.baseUrl}/${def.id}`, def);
    }
    return this.http.post<TransformationDefinition>(`${this.baseUrl}`, def);
  }

  public duplicate(id: number): Observable<TransformationDefinition> {
    return this.http.post<TransformationDefinition>(`${this.baseUrl}/${id}/duplicate`, null);
  }

  public delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}

export class TransformationResult {
  public result?: string;
  public error?: string;
}
