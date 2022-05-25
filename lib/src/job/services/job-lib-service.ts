import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {JobLog} from '../model/jobLog';

@Injectable()
export class JobLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/job-logs`;
  }

  public getJobStatus(jobId: number): Observable<JobLog> {
    return this.http.get<JobLog>(`${this.baseUrl}/${jobId}`);
  }
}