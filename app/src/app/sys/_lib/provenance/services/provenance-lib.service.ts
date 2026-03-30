import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {SearchHttpParams} from '@termx-health/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Provenance} from 'term-web/sys/_lib/provenance/model/provenance';

@Injectable()
export class ProvenanceLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/provenances`;

  public query(target: string): Observable<Provenance[]> {
    return this.http.get<Provenance[]>(`${this.baseUrl}`, {params: SearchHttpParams.build({target: target})});
  }
}
