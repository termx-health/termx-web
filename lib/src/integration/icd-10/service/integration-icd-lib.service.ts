import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {IntegrationImportConfiguration} from '../../model/integration-import-configuration';
import {Observable} from 'rxjs';
import {JobLogResponse} from '../../../job';
import {SearchHttpParams} from '@kodality-web/core-util';

@Injectable()
export class IntegrationIcdLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/icd10`;
  }

  public import(params: IntegrationImportConfiguration, edition: string, url: string): Observable<JobLogResponse> {
    if (edition === 'est') {
      return this.http.post<JobLogResponse>(`${this.baseUrl}-${edition}/import`, params, {
        params: SearchHttpParams.build({
          url: url
        })
      });
    }
    return this.http.post<JobLogResponse>(`${this.baseUrl}/import`, params, {
      params: SearchHttpParams.build({
        url: url
      })
    });
  }
}