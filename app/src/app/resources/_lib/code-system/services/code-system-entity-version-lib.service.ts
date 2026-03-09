import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {CodeSystemEntityVersion} from 'term-web/resources/_lib/code-system';

@Injectable()
export class CodeSystemEntityVersionLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/ts/code-system-entity-versions`;

  public load(id: number): Observable<CodeSystemEntityVersion> {
    return this.http.get<CodeSystemEntityVersion>(`${this.baseUrl}/${id}`);
  }
}
