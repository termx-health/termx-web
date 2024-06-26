import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {JobLogResponse} from 'term-web/sys/_lib';
import {IntegrationImportConfiguration} from '../../model/integration-import-configuration';

@Injectable()
export class IntegrationIchiLibService {
  protected baseUrl = `${environment.termxApi}/ichi-uz`;

  public constructor(protected http: HttpClient) { }

  public import(params: IntegrationImportConfiguration, url: string): Observable<JobLogResponse> {
    const postUrl = this.baseUrl;
    return this.http.post<JobLogResponse>(`${postUrl}/import`, params, {
      params: SearchHttpParams.build({
        url: url
      })
    });
  }
}
