import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API_URL} from '../../../terminology-lib.config';
import {HttpClient} from '@angular/common/http';
import {IntegrationImportConfiguration} from '../../model/integration-import-configuration';
import {Observable} from 'rxjs';
import {JobLogResponse} from '../../../job';
import {SearchHttpParams} from '@kodality-web/core-util';

@Injectable()
export class IntegrationOrphanetLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API_URL) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/orphanet`;
  }

  public import(params: IntegrationImportConfiguration, url: string): Observable<JobLogResponse> {
    const postUrl = this.baseUrl;
    return this.http.post<JobLogResponse>(`${postUrl}/import`, params, {
      params: SearchHttpParams.build({
        url: url
      })
    });
  }
}
