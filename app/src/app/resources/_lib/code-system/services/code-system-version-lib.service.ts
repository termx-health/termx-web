import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {CodeSystemVersion} from 'term-web/resources/_lib/code-system/model/code-system-version';

@Injectable()
export class CodeSystemVersionLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/ts/code-system-versions`;

  public load(id: number): Observable<CodeSystemVersion> {
    return this.http.get<CodeSystemVersion>(`${this.baseUrl}/${id}`);
  }
}
