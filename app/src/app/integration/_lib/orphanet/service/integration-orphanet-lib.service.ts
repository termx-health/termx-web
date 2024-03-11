import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {mergeMap, Observable, timer} from 'rxjs';
import {JobLibService, JobLog, JobLogResponse} from 'term-web/sys/_lib';
import {IntegrationImportConfiguration} from '../../model/integration-import-configuration';

@Injectable()
export class IntegrationOrphanetLibService {
  protected baseUrl = `${environment.termxApi}/orphanet`;

  public constructor(protected http: HttpClient, private jobService: JobLibService) { }

  public import(req: IntegrationImportConfiguration, file: Blob, destroy$: Observable<any> = timer(60_000)): Observable<JobLog> {
    const fd = new FormData();
    fd.append('request', JSON.stringify(req));
    if (file) {
      fd.append('file', file, 'files');
    }

    return this.http.post<JobLogResponse>(`${this.baseUrl}/import`, fd).pipe(
      mergeMap(resp => this.jobService.pollFinishedJobLog(resp.jobId, destroy$))
    );
  }
}
