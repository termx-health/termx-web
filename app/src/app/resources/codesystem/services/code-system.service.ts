import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  CodeSystem,
  CodeSystemAssociation,
  CodeSystemConcept,
  CodeSystemEntityVersion,
  CodeSystemLibService,
  CodeSystemSupplement,
  CodeSystemVersion,
  Designation,
  EntityProperty,
  EntityPropertyValue
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
    if (concept.id) {
      return this.http.put(`${this.baseUrl}/${codeSystemId}/concepts/${concept.id}`, concept);
    }
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

  public saveEntityPropertyValue(codeSystemId: string, conceptVersionId: number, propertyValue: EntityPropertyValue): Observable<EntityPropertyValue> {
    if (propertyValue.id) {
      return this.http.put<EntityPropertyValue>(
        `${this.baseUrl}/${codeSystemId}/entity-versions/${conceptVersionId}/entity-property-values/${propertyValue.id}`, propertyValue);
    }
    return this.http.post<EntityPropertyValue>(`${this.baseUrl}/${codeSystemId}/entity-versions/${conceptVersionId}/entity-property-values/`, propertyValue);
  }

  public deleteEntityProperty(codeSystemId: string, propertyId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}/entity-properties/${propertyId}`);
  }

  public saveSupplement(codeSystemId: string, supplement: CodeSystemSupplement, conceptVersionId?: number): Observable<CodeSystemSupplement> {
    let url = `${this.baseUrl}/${codeSystemId}/supplements`;
    if (conceptVersionId) {
      url = `${this.baseUrl}/${codeSystemId}/entities/versions/${conceptVersionId}/supplements`;
    }
    if (supplement.id) {
      return this.http.put<CodeSystemSupplement>(`${url}/${supplement.id}`, supplement);
    }
    return this.http.post<CodeSystemSupplement>(`${url}`, supplement);
  }

  public saveDesignation(codeSystemId: string, conceptVersionId: number, designation: Designation): Observable<Designation> {
    if (designation.id) {
      return this.http.put<Designation>(`${this.baseUrl}/${codeSystemId}/entity-versions/${conceptVersionId}/designations/${designation.id}`, designation);
    }
    return this.http.post<Designation>(`${this.baseUrl}/${codeSystemId}/entity-versions/${conceptVersionId}/designations`, designation);
  }

  public deleteDesignation(codeSystemId: string, designationId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}/designations/${designationId}`);
  }

  public saveAssociation(codeSystemId: string, conceptVersionId: number, association: CodeSystemAssociation): Observable<CodeSystemAssociation> {
    if (association.id) {
      return this.http.put<Designation>(`${this.baseUrl}/${codeSystemId}/entity-versions/${conceptVersionId}/associations/${association.id}`, association);
    }
    return this.http.post<Designation>(`${this.baseUrl}/${codeSystemId}/entity-versions/${conceptVersionId}/associations`, association);
  }
}
