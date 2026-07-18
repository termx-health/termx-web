import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams} from '@termx-health/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {JobLogResponse} from 'term-web/sys/_lib';
import {IntegrationImportConfiguration} from 'term-web/integration/_lib/model/integration-import-configuration';

@Injectable()
export class IntegrationIcdLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/icd10`;

  public import(params: IntegrationImportConfiguration, edition: string, url: string): Observable<JobLogResponse> {
    return this.http.post<JobLogResponse>(`${this.baseUrl}/import`, params, {
      params: SearchHttpParams.build({
        url: url
      })
    });
  }
}
