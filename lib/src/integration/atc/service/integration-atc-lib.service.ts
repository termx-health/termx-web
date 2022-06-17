import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {IntegrationImportConfiguration} from '../../model/integration-import-configuration';
import {Observable} from 'rxjs';
import {JobLogResponse} from '../../../job';

@Injectable()
export class IntegrationAtcLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/atc`;
  }

  public import(params: IntegrationImportConfiguration, language?: string): Observable<JobLogResponse> {
    if (language) {
      return this.http.post<JobLogResponse>(`${this.baseUrl}-${language}/import`, params);
    }
    return this.http.post<JobLogResponse>(`${this.baseUrl}/import`, params);
  }
}