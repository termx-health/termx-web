import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';


export interface FileAnalysisRequest {
  link: string;
  type: string;
}

export interface FileAnalysisResponse {
  // parsed properties from the file
  columns?: FileAnalysisResponseColumn[];
}

export interface FileAnalysisResponseColumn {
  columnName?: string;
  columnType?: string;
  columnTypeFormat?: string;
  hasValues?: boolean;
}


@Injectable()
export class FileAnalysisService {
  protected baseUrl = `${environment.terminologyApi}/file-importer`;

  public constructor(protected http: HttpClient) { }

  public analyze(req: FileAnalysisRequest, file?: Blob): Observable<FileAnalysisResponse> {
    const fd = new FormData();
    fd.append('request', JSON.stringify(req));
    if (file) {
      fd.append('file', file, 'files');
    }
    return this.http.post<FileAnalysisResponse>(`${this.baseUrl}/analyze`, fd);
  }
}
