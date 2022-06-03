import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CodeSystem, CodeSystemConcept, CodeSystemEntityVersion, CodeSystemLibService, CodeSystemVersion} from 'terminology-lib/resources';

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

  public saveConcept(codeSystemId: string, concept: CodeSystemConcept): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/concepts`, concept);
  }

  public deleteCodeSystemEntityVersion(codeSystemId: string, version: string, entityVersion: CodeSystemEntityVersion): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/entity-versions`, {body: entityVersion});
  }

  public addCodeSystemEntityVersion(codeSystemId: string, version: string, entityVersion: CodeSystemEntityVersion): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/entity-versions`, entityVersion);
  }
}
