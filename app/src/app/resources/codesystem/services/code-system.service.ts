import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  CodeSystem,
  CodeSystemConcept,
  CodeSystemEntityVersion,
  CodeSystemLibService,
  CodeSystemSupplement,
  CodeSystemVersion,
  EntityProperty
} from 'terminology-lib/resources';

@Injectable()
export class CodeSystemService extends CodeSystemLibService {
  public save(cs: CodeSystem): Observable<CodeSystem> {
    return this.http.post(this.baseUrl, cs);
  }

  public saveVersion(codeSystemId: string, version: CodeSystemVersion): Observable<CodeSystemVersion> {
    if (version.id && version.version) {
      return this.http.put(`${this.baseUrl}/${codeSystemId}/versions/${version.id}`, version);
    }
    return this.http.post(`${this.baseUrl}/${codeSystemId}/versions`, version);
  }

  public activateVersion(codeSystemId: string, version: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/activate`, {});
  }

  public retireVersion(codeSystemId: string, version: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/retire`, {});
  }

  public duplicateCodeSystem(codeSystemId: string, duplicateRequest: {codeSystem: string, codeSystemUri: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/duplicate`, duplicateRequest);
  }

  public duplicateCodeSystemVersion(codeSystemId: string, version: string, duplicateRequest: {codeSystem: string, version: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/duplicate`, duplicateRequest);
  }

  public saveConcept(codeSystemId: string, concept: CodeSystemConcept): Observable<CodeSystemConcept> {
    return this.http.post(`${this.baseUrl}/${codeSystemId}/concepts`, concept);
  }

  public saveEntityVersion(codeSystemId: string, entityId: number, entityVersion: CodeSystemEntityVersion): Observable<CodeSystemEntityVersion> {
    if (entityVersion.id) {
      return this.http.put(`${this.baseUrl}/${codeSystemId}/entities/${entityId}/versions/${entityVersion.id}`, entityVersion);
    }
    return this.http.post(`${this.baseUrl}/${codeSystemId}/entities/${entityId}/versions`, entityVersion);
  }

  public activateEntityVersion(codeSystemId: string, id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/entities/versions/${id}/activate`, {});
  }

  public retireEntityVersion(codeSystemId: string, id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/entities/versions/${id}/retire`, {});
  }

  public unlinkEntityVersion(codeSystemId: string, version: string, entityVersionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/entity-versions/${entityVersionId}/membership`);
  }

  public linkEntityVersion(codeSystemId: string, version: string, entityVersionId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/entity-versions/${entityVersionId}/membership`, {});
  }

  public saveEntityProperty(codeSystemId: string, property: EntityProperty): Observable<EntityProperty> {
    if (property.id) {
      return this.http.put<EntityProperty>(`${this.baseUrl}/${codeSystemId}/entity-properties/${property.id}`, property);
    }
    return this.http.post<EntityProperty>(`${this.baseUrl}/${codeSystemId}/entity-properties/`, property);
  }

  public deleteEntityProperty(codeSystemId: string, propertyId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}/entity-properties/${propertyId}`);
  }

  public saveSupplement(codeSystemId: string, supplement: CodeSystemSupplement): Observable<CodeSystemSupplement> {
    if (supplement.id) {
      return this.http.put<CodeSystemSupplement>(`${this.baseUrl}/${codeSystemId}/supplements/${supplement.id}`, supplement);
    }
    return this.http.post<CodeSystemSupplement>(`${this.baseUrl}/${codeSystemId}/supplements/`, supplement);
  }
}
