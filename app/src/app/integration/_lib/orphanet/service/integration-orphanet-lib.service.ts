import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {environment} from 'environments/environment';
import {mergeMap, Observable, timer} from 'rxjs';
import {JobLibService, JobLog, JobLogResponse} from 'term-web/sys/_lib';
import {IntegrationImportConfiguration} from 'term-web/integration/_lib/model/integration-import-configuration';

@Injectable()
export class IntegrationOrphanetLibService {
  protected http = inject(HttpClient);
  private jobService = inject(JobLibService);

  protected baseUrl = `${environment.termxApi}/orphanet`;

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
