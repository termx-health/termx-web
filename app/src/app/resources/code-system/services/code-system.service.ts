import {HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {isDefined, serializeDate} from '@kodality-web/core-util';
import {saveAs} from 'file-saver';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {UriUtil} from 'term-web/core/utils/uri-util';
import {CodeSystemConcept, CodeSystemLibService, CodeSystemTransactionRequest, CodeSystemVersion, ConceptTransactionRequest} from 'term-web/resources/_lib';
import {LorqueProcess} from 'term-web/sys/_lib';

@Injectable()
export class CodeSystemService extends CodeSystemLibService {

  public saveCodeSystem(request: CodeSystemTransactionRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transaction`, request);
  }

  public duplicateCodeSystem(codeSystemId: string, duplicateRequest: {codeSystem: string, codeSystemUri: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/duplicate`, duplicateRequest);
  }

  public supplementCodeSystem(codeSystemId: string, request: {codeSystem: string, codeSystemUri: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/supplement`, request);
  }

  public changeCodeSystemId(currentId: string, newId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${currentId}/change-id`, {id: newId});
  }

  public deleteCodeSystem(codeSystemId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}`);
  }

  public saveCodeSystemVersion(codeSystemId: string, version: CodeSystemVersion): Observable<CodeSystemVersion> {
    version.releaseDate = serializeDate(version.releaseDate);
    version.expirationDate = version.expirationDate ? serializeDate(version.expirationDate) : undefined;

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
    request.concept?.versions?.forEach(v => v?.propertyValues?.forEach(pv => {
      if (pv.value instanceof Date) {
        pv.value = serializeDate(pv.value);
      }
    }));

    if (version) {
      return this.http.post(`${this.baseUrl}/${codeSystemId}/versions/${version}/concepts/transaction`, request);
    }
    return this.http.post(`${this.baseUrl}/${codeSystemId}/concepts/transaction`, request);
  }

  public deleteConcept(code: string, codeSystemId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codeSystemId}/concepts/${code}`);
  }

  public exportConcepts(codeSystemId: string, version: string, format: string): Observable<LorqueProcess> {
    return this.http.get(`${this.baseUrl}/${codeSystemId}/versions/${version}/concepts/export?format=${format}`)
      .pipe(map(res => res as LorqueProcess));
  }

  public getConceptExportResult(processId: number, format: string, fileName: string): void {
    this.http.get(`${this.baseUrl}/concepts/export-${format}/result/${processId}`, {
      responseType: 'blob',
      headers: new HttpHeaders({Accept: format === 'xlsx' ? `application/vnd.ms-excel` : `application/csv`})
    }).subscribe(res => saveAs(res, `${fileName}.${format}`));
  }


  public propagateProperties(codeSystemId: string, conceptCode: string, targetConceptIds: number[]): Observable<void> {
    conceptCode = UriUtil.encodeUriAll(UriUtil.encodeUriAll(conceptCode));
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

  public duplicateEntityVersion(codeSystemId: string, id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/entity-versions/${id}/duplicate`, {});
  }

  public supplementEntityVersions(codeSystemId: string, codeSystemVersion: string, request: {ids?: number[], externalSystemCode?: string}): Observable<void> {
    if (isDefined(codeSystemVersion)) {
      return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${codeSystemVersion}/entity-versions/supplement`, request);
    }
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/entity-versions/supplement`, request);
  }

  public activateEntityVersions(codeSystemId: string, version: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${codeSystemId}/versions/${version}/entity-versions/activate`, {});
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
