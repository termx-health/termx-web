import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {ValueSetVersion} from 'term-web/resources/_lib/value-set/model/value-set-version';

@Injectable()
export class ValueSetVersionLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/ts/value-set-versions`;

  public load(id: number): Observable<ValueSetVersion> {
    return this.http.get<ValueSetVersion>(`${this.baseUrl}/${id}`);
  }
}
