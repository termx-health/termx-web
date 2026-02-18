import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {environment} from 'environments/environment';
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
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/file-importer`;

  public analyze(req: FileAnalysisRequest, file?: Blob): Observable<FileAnalysisResponse> {
    const fd = new FormData();
    fd.append('request', JSON.stringify(req));
    if (file) {
      fd.append('file', file, 'files');
    }
    return this.http.post<FileAnalysisResponse>(`${this.baseUrl}/analyze`, fd);
  }
}
