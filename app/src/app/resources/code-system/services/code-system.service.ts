import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CodeSystemConcept, CodeSystemLibService, CodeSystemTransactionRequest, CodeSystemVersion, ConceptTransactionRequest} from 'term-web/resources/_lib';

@Injectable()
export class CodeSystemService extends CodeSystemLibService {

  public saveTransaction(request: CodeSystemTransactionRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transaction`, request);
  }

  public duplicateCodeSystem(codeSystemId: string, duplicateRequest: {codeSystem: string, codeSystemUri: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/duplicate`, duplicateRequest);
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

  public duplicateCodeSystemVersion(codeSystemId: string, version: string, duplicateRequest: {codeSystem: string, version: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/duplicate`, duplicateRequest);
  }

  public saveConceptTransaction(codeSystemId: string, version: string, request: ConceptTransactionRequest): Observable<CodeSystemConcept> {
    if (version) {
      return this.http.post(`${this.baseUrl}/${codeSystemId}/versions/${version}/concepts/transaction`, request);
    }
    return this.http.post(`${this.baseUrl}/${codeSystemId}/concepts/transaction`, request);
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

  public unlinkEntityVersions(codeSystemId: string, codeSystemVersion: string, entityVersionIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${codeSystemVersion}/unlink`, {entityVersionIds: entityVersionIds});
  }

  public linkEntityVersions(codeSystemId: string, codeSystemVersion: string, entityVersionIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${codeSystemVersion}/link`, {entityVersionIds: entityVersionIds});
  }

  public deleteEntityPropertyUsages(codeSystemId: string, propertyId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}/entity-property-usages/${propertyId}`);
  }
}
