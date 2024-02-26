import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {ValueSetVersion} from '../model/value-set-version';

@Injectable()
export class ValueSetVersionLibService {
  protected baseUrl = `${environment.termxApi}/ts/value-set-versions`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<ValueSetVersion> {
    return this.http.get<ValueSetVersion>(`${this.baseUrl}/${id}`);
  }
}
