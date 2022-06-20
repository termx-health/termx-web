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