import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API_URL} from '../../terminology-lib.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {JobLog} from '../model/job-log';

@Injectable()
export class JobLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API_URL) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/job-logs`;
  }

  public getLog(jobId: number): Observable<JobLog> {
    return this.http.get<JobLog>(`${this.baseUrl}/${jobId}`);
  }
}
