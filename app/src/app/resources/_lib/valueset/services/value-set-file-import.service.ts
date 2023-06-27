import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {JobLibService, JobLog, JobLogResponse} from 'term-web/sys/_lib';
import {mergeMap, Observable, timer} from 'rxjs';

export interface FileProcessingRequest {
  type: string; //json, fsh
}

@Injectable()
export class ValueSetFileImportService {
  public readonly baseUrl = `${environment.termxApi}/file-importer/value-set`;

  public constructor(private http: HttpClient, private jobService: JobLibService) {}

  public processRequest(req: FileProcessingRequest, file: Blob, destroy$: Observable<any> = timer(60_000)): Observable<JobLog> {
    const fd = new FormData();
    fd.append('request', JSON.stringify(req));
    if (file) {
      fd.append('file', file, 'files');
    }

    return this.http.post<JobLogResponse>(`${this.baseUrl}/process`, fd).pipe(
      mergeMap(resp => this.jobService.pollFinishedJobLog(resp.jobId, destroy$))
    );
  };
}
