import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {CodeSystemConcept, CodeSystemLibService, CodeSystemTransactionRequest, CodeSystemVersion, ConceptTransactionRequest} from 'term-web/resources/_lib';

@Injectable()
export class CodeSystemService extends CodeSystemLibService {

  public saveCodeSystem(request: CodeSystemTransactionRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transaction`, request);
  }

  public duplicateCodeSystem(codeSystemId: string, duplicateRequest: {codeSystem: string, codeSystemUri: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/duplicate`, duplicateRequest);
  }

  public changeCodeSystemId(currentId: string, newId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${currentId}/change-id`, {id: newId});
  }

  public deleteCodeSystem(codeSystemId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}`);
  }

  public saveCodeSystemVersion(codeSystemId: string, version: CodeSystemVersion): Observable<CodeSystemVersion> {
    if (version.id && version.version) {
      return this.http.put(`${this.baseUrl}/${codeSystemId}/versions/${version.version}`, version);
    }
    return this.http.post(`${this.baseUrl}/${codeSystemId}/versions`, version);
  }

  public changeCodeSystemVersionStatus(codeSystemId: string, version: string, status: 'draft' | 'active' | 'retired'): Observable<void> {
    if (status === 'draft') {
      return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/draft`, {});
    }
    if (status === 'active') {
      return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/activate`, {});
    }
    if (status === 'retired') {
      return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/retire`, {});
    }
    return of();
  }

  public duplicateCodeSystemVersion(codeSystemId: string, version: string, duplicateRequest: {codeSystem: string, version: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/duplicate`, duplicateRequest);
  }

  public deleteCodeSystemVersion(codeSystemId: string, version: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}`);
  }

  public saveConcept(codeSystemId: string, version: string, request: ConceptTransactionRequest): Observable<CodeSystemConcept> {
    if (version) {
      return this.http.post(`${this.baseUrl}/${codeSystemId}/versions/${version}/concepts/transaction`, request);
    }
    return this.http.post(`${this.baseUrl}/${codeSystemId}/concepts/transaction`, request);
  }

  public propagateProperties(codeSystemId: string, conceptCode: string, targetConceptIds: number[]): Observable<void> {
    conceptCode = encodeURIComponent(encodeURIComponent(conceptCode));
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/concepts/${conceptCode}/propagate-properties`, {targetConceptIds: targetConceptIds});
  }

  public changeEntityVersionStatus(codeSystemId: string, id: number, status: 'draft' | 'active' | 'retired'): Observable<void> {
    if (status === 'draft') {
      return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/entity-versions/${id}/draft`, {});
    }
    if (status === 'active') {
      return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/entity-versions/${id}/activate`, {});
    }
    if (status === 'retired') {
      return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/entity-versions/${id}/retire`, {});
    }
    return of();
  }

  public deleteEntityVersion(codeSystemId: string, id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${codeSystemId}/entity-versions/${id}`);
  }

  public duplicateEntityVersion(codeSystemId: string, entityId: number, id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/entity-versions/${id}/duplicate`, {});
  }

  public unlinkEntityVersions(codeSystemId: string, codeSystemVersion: string, entityVersionIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${codeSystemVersion}/concepts/unlink`, {entityVersionIds: entityVersionIds});
  }

  public linkEntityVersions(codeSystemId: string, codeSystemVersion: string, entityVersionIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${codeSystemVersion}/concepts/link`, {entityVersionIds: entityVersionIds});
  }

  public deleteEntityPropertyUsages(codeSystemId: string, propertyId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/entity-properties/${propertyId}/delete-usages`, {});
  }
}
