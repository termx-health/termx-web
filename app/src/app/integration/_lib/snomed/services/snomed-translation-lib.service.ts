import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {saveAs} from 'file-saver';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SnomedTranslation} from 'term-web/integration/_lib';
import {LorqueProcess} from 'term-web/sys/_lib';

@Injectable()
export class SnomedTranslationLibService {
  protected baseUrl = `${environment.termxApi}/snomed`;

  public constructor(protected http: HttpClient) { }

  public loadTranslations(params: {active?: boolean, unlinked?: boolean, branch?: string}): Observable<SnomedTranslation[]> {
    return this.http.get(`${this.baseUrl}/translations`, {params: SearchHttpParams.build(params)}).pipe(map(resp => resp as SnomedTranslation[]));
  }

  public loadConceptTranslations(conceptId: string): Observable<SnomedTranslation[]> {
    return this.http.get(`${this.baseUrl}/concepts/${conceptId}/translations`).pipe(map(resp => resp as SnomedTranslation[]));
  }

  public load(id: number): Observable<SnomedTranslation> {
    return this.http.get(`${this.baseUrl}/translations/${id}`).pipe(map(resp => resp as SnomedTranslation));
  }

  public startRF2Export(): Observable<LorqueProcess> {
    return this.http.post(`${this.baseUrl}/translations/export-rf2`, {}).pipe(map(res => res as LorqueProcess));
  }

  public getRF2(processId: number): void {
    this.http.get(`${this.baseUrl}/translations/export-rf2/result/${processId}`, {
      responseType: 'blob',
      headers: new HttpHeaders({Accept: 'application/zip'})
    }).subscribe(res => saveAs(res, `snomed-translations_${new Date().toISOString()}.zip`));
  }
}
