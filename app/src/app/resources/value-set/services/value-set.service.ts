import {HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {serializeDate} from '@kodality-web/core-util';
import {saveAs} from 'file-saver';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {ValueSetLibService, ValueSetTransactionRequest, ValueSetVersion, ValueSetVersionRule, ValueSetVersionRuleSet} from 'term-web/resources/_lib';
import {LorqueProcess} from 'term-web/sys/_lib';

@Injectable()
export class ValueSetService extends ValueSetLibService {

  public saveValueSet(request: ValueSetTransactionRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transaction`, request);
  }

  public changeValueSetId(currentId: string, newId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${currentId}/change-id`, {id: newId});
  }

  public deleteValueSet(valueSetId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${valueSetId}`);
  }

  public saveValueSetVersion(valueSetId: string, version: ValueSetVersion): Observable<ValueSetVersion> {
    version.releaseDate = serializeDate(version.releaseDate);
    version.expirationDate = version.expirationDate ? serializeDate(version.expirationDate) : undefined;

    if (version.id && version.version) {
      return this.http.put(`${this.baseUrl}/${valueSetId}/versions/${version.version}`, version);
    }
    return this.http.post(`${this.baseUrl}/${valueSetId}/versions`, version);
  }

  public changeValueSetVersionStatus(valueSetId: string, version: string, status: 'draft' | 'active' | 'retired'): Observable<void> {
    if (status === 'draft') {
      return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/draft`, {});
    }
    if (status === 'active') {
      return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/activate`, {});
    }
    if (status === 'retired') {
      return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/retire`, {});
    }
    return of();
  }

  public duplicateValueSetVersion(valueSetId: string, version: string, duplicateRequest: {valueSet: string, version: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${valueSetId}/versions/${version}/duplicate`, duplicateRequest);
  }

  public deleteValueSetVersion(valueSetId: string, version: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${valueSetId}/versions/${version}`);
  }

  public saveRule(valueSetId: string, valueSetVersion: string, rule: ValueSetVersionRule): Observable<ValueSetVersionRule> {
    if (rule.id) {
      return this.http.put<ValueSetVersionRule>(`${this.baseUrl}/${valueSetId}/versions/${valueSetVersion}/rules/${rule.id}`, rule);
    }
    return this.http.post<ValueSetVersionRule>(`${this.baseUrl}/${valueSetId}/versions/${valueSetVersion}/rules`, rule);
  }

  public saveRuleSet(valueSetId: string, valueSetVersion: string, ruleSet: ValueSetVersionRuleSet): Observable<ValueSetVersionRuleSet> {
    return this.http.put<ValueSetVersionRule>(`${this.baseUrl}/${valueSetId}/versions/${valueSetVersion}/rule-sets/${ruleSet.id}`, ruleSet);
  }

  public deleteRule(valueSetId: string, valueSetVersion: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${valueSetId}/versions/${valueSetVersion}/rules/${id}`);
  }

  public exportConcepts(valueSet: string, version: string, format: string): Observable<LorqueProcess> {
    return this.http.get(`${this.baseUrl}/${valueSet}/versions/${version}/expansion-export?format=${format}`)
      .pipe(map(res => res as LorqueProcess));
  }

  public getConceptExportResult(processId: number, format: string, fileName: string): void {
    this.http.get(`${this.baseUrl}/expansion-export-${format}/result/${processId}`, {
      responseType: 'blob',
      headers: new HttpHeaders({Accept: format === 'xlsx' ? `application/vnd.ms-excel` : `application/csv`})
    }).subscribe(res => saveAs(res, `${fileName}.${format}`));
  }

}
