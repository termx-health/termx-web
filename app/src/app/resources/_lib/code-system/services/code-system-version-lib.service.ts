import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {CodeSystemVersion} from '../model/code-system-version';

@Injectable()
export class CodeSystemVersionLibService {
  protected baseUrl = `${environment.termxApi}/ts/code-system-versions`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<CodeSystemVersion> {
    return this.http.get<CodeSystemVersion>(`${this.baseUrl}/${id}`);
  }
}
