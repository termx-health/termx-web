import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {LocalizedName} from '@kodality-web/marina-util';
import {environment} from 'environments/environment';
import {saveAs} from 'file-saver';
import {mergeMap, Observable, timer} from 'rxjs';
import {MapSetScope} from 'term-web/resources/_lib';
import {JobLibService, JobLog, JobLogResponse} from 'term-web/sys/_lib';

export interface FileProcessingRequest {
  type?: string;
  url?: string;
  mapSet: {
    id?: string;
    title?: LocalizedName;
    uri?: string;
    description?: LocalizedName;
  };
  mapSetVersion?: {
    status?: string;
    version?: string;
    releaseDate?: Date;
    scope?: MapSetScope;
  };

  cleanRun?: boolean;
  cleanAssociationRun?: boolean;
}

@Injectable()
export class MapSetFileImportService {
  public readonly baseUrl = `${environment.termxApi}/file-importer/map-set`;

  public constructor(private http: HttpClient, private jobService: JobLibService) {}

  public getTemplate(): void {
    this.http.get(`${this.baseUrl}/csv-template`, {
      responseType: 'blob',
      headers: new HttpHeaders({Accept: 'application/csv'})
    }).subscribe(res => saveAs(res, `mapset-template.csv`));
  }

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
