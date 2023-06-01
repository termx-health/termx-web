import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  CodeSystem,
  CodeSystemConcept,
  CodeSystemEntityVersion,
  CodeSystemLibService,
  CodeSystemSupplement,
  CodeSystemTransactionRequest,
  CodeSystemVersion,
} from 'term-web/resources/_lib';

@Injectable()
export class CodeSystemService extends CodeSystemLibService {

  public save(cs: CodeSystem): Observable<CodeSystem> {
    return this.http.post(this.baseUrl, cs);
  }

  public saveTransaction(request: CodeSystemTransactionRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transaction`, request);
  }

  public delete(codeSystemId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}`);
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

  public saveVersionAsDraft(codeSystemId: string, version: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/draft`, {});
  }

  public duplicateCodeSystem(codeSystemId: string, duplicateRequest: {codeSystem: string, codeSystemUri: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/duplicate`, duplicateRequest);
  }

  public duplicateCodeSystemVersion(codeSystemId: string, version: string, duplicateRequest: {codeSystem: string, version: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/duplicate`, duplicateRequest);
  }

  public saveConcept(codeSystemId: string, concept: CodeSystemConcept, full?: boolean): Observable<CodeSystemConcept> {
    if (concept.id) {
      return this.http.put(`${this.baseUrl}/${codeSystemId}/concepts/${concept.id}?full=${full}`, concept);
    }
    return this.http.post(`${this.baseUrl}/${codeSystemId}/concepts?full=${full}`, concept);
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

  public saveEntityVersionAsDraft(codeSystemId: string, id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/entities/versions/${id}/draft`, {});
  }

  public duplicateEntityVersion(codeSystemId: string, entityId: number, id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/entities/${entityId}/versions/${id}/duplicate`, {});
  }

  public unlinkEntityVersion(codeSystemId: string, version: string, entityVersionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/entity-versions/${entityVersionId}/membership`);
  }

  public linkEntityVersion(codeSystemId: string, version: string, entityVersionId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/entity-versions/${entityVersionId}/membership`, {});
  }

  public deleteEntityPropertyUsages(codeSystemId: string, propertyId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}/entity-property-usages/${propertyId}`);
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
}
