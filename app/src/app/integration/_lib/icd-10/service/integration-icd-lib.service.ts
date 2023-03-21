import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchHttpParams} from '@kodality-web/core-util';
import {JobLogResponse} from 'term-web/job/_lib';
import {environment} from 'environments/environment';
import {IntegrationImportConfiguration} from '../../model/integration-import-configuration';

@Injectable()
export class IntegrationIcdLibService {
  protected baseUrl = `${environment.terminologyApi}/icd10`;

  public constructor(protected http: HttpClient) { }

  public import(params: IntegrationImportConfiguration, edition: string, url: string): Observable<JobLogResponse> {
    const postUrl = this.getEditionBaseUrl(edition);
    return this.http.post<JobLogResponse>(`${postUrl}/import`, params, {
      params: SearchHttpParams.build({
        url: url
      })
    });
  }

  private getEditionBaseUrl(edition: string): string {
    if (edition === 'int') {
      return this.baseUrl;
    }
    return this.baseUrl + '-' + edition;
  }
}
