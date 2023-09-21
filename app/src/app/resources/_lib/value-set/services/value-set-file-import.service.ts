import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {JobLibService, JobLog, JobLogResponse} from 'term-web/sys/_lib';
import {mergeMap, Observable, timer} from 'rxjs';
import {LocalizedName} from '@kodality-web/marina-util';

export interface FileProcessingRequest {
  link?: string;
  type?: string; //json, fsh, csv, tsv

  valueSet?: {id?: string, uri?: string, name?: string, oid?: string, title?: LocalizedName, description?: LocalizedName};
  version?: {number?: string, status?: string, releaseDate?: Date, rule?: {id?: number, codeSystem?: string, codeSystemVersionId?: number}};
  mapping?: {codeColumnName?: string, displayColumnName?: string};

  dryRun?: boolean;
  importClass?: string;
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
