import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';

export interface WikiGithubImportRequest {
  spaceId: number;
  url?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  dir?: string;
  token?: string;
}

export interface WikiGithubImportResult {
  repo: string;
  branch: string;
  dir: string;
  pages: number;
}

@Injectable({providedIn: 'root'})
export class SpaceGithubImportService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.termxApi}/wiki-import`;

  public importFromGithub(req: WikiGithubImportRequest): Observable<WikiGithubImportResult> {
    return this.http.post<WikiGithubImportResult>(`${this.baseUrl}/github`, req);
  }
}
