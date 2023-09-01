import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {JobLibService, JobLog, JobLogResponse} from 'term-web/sys/_lib';
import {mergeMap, Observable, timer} from 'rxjs';
import {LocalizedName} from '@kodality-web/marina-util';

export interface FileProcessingRequest {
  type?: string;
  map: {
    id?: string;
    names?: LocalizedName;
    uri?: string;
  };
  version?: {
    version?: string;
    releaseDate?: Date;
  };

  sourceValueSet?: string;
  targetValueSet?: string;
}

@Injectable()
export class MapSetFileImportService {
  public readonly baseUrl = `${environment.termxApi}/file-importer/map-set`;

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
