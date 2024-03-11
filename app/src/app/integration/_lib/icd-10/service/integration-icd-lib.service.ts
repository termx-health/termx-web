import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {JobLogResponse} from 'term-web/sys/_lib';
import {IntegrationImportConfiguration} from '../../model/integration-import-configuration';

@Injectable()
export class IntegrationIcdLibService {
  protected baseUrl = `${environment.termxApi}/icd10`;

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
