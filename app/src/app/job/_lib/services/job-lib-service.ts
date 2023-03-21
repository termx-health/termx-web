import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {JobLog} from '../model/job-log';

@Injectable()
export class JobLibService {
  protected baseUrl = `${environment.terminologyApi}/job-logs`;

  public constructor(protected http: HttpClient) { }

  public getLog(jobId: number): Observable<JobLog> {
    return this.http.get<JobLog>(`${this.baseUrl}/${jobId}`);
  }
}
