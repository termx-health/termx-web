import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {CodeSystemVersion} from '../model/code-system-version';

@Injectable()
export class CodeSystemVersionLibService {
  protected baseUrl = `${environment.terminologyApi}/ts/code-system-versions`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<CodeSystemVersion> {
    return this.http.get<CodeSystemVersion>(`${this.baseUrl}/${id}`);
  }
}
