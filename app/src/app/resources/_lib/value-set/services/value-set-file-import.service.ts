import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {serializeDate} from '@termx-health/core-util';
import {LocalizedName} from '@termx-health/util';
import {environment} from 'environments/environment';
import {mergeMap, Observable, timer} from 'rxjs';
import {JobLibService, JobLog, JobLogResponse} from 'term-web/sys/_lib';

export interface FileProcessingRequest {
  link?: string;
  type?: string; //json, fsh, csv, tsv

  valueSet?: {id?: string, uri?: string, name?: string, oid?: string, title?: LocalizedName, description?: LocalizedName};
  version?: {number?: string, status?: string, releaseDate?: Date | string, rule?: {id?: number, codeSystem?: string, codeSystemVersionId?: number}};
  mapping?: {code?: string, display?: string};

  dryRun?: boolean;
  importClass?: string;
}

@Injectable()
export class ValueSetFileImportService {
  private http = inject(HttpClient);
  private jobService = inject(JobLibService);

  public readonly baseUrl = `${environment.termxApi}/file-importer/value-set`;

  public processRequest(req: FileProcessingRequest, file: Blob, destroy$: Observable<any> = timer(60_000)): Observable<JobLog> {
    if (req.version?.releaseDate) {
      req.version.releaseDate = serializeDate(req.version.releaseDate);
    }
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
