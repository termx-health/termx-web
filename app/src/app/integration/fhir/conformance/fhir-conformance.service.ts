import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {LorqueProcess} from 'term-web/sys/_lib/lorque/model/lorque-process';

export interface TxConformanceRunRequest {
  suite?: string;
  filter?: string;
  mode?: string;
  archiveUuid?: string;
}

@Injectable()
export class FhirConformanceService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.termxApi}/tx-conformance`;

  /** Starts an async tx-ecosystem conformance run; poll the returned LorqueProcess for the TestReport. */
  public run(request: TxConformanceRunRequest): Observable<LorqueProcess> {
    return this.http.post<LorqueProcess>(`${this.baseUrl}/runs`, request);
  }
}
