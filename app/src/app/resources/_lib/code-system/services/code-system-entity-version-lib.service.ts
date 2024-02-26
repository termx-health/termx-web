import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {CodeSystemEntityVersion} from '../../code-system';

@Injectable()
export class CodeSystemEntityVersionLibService {
  protected baseUrl = `${environment.termxApi}/ts/code-system-entity-versions`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<CodeSystemEntityVersion> {
    return this.http.get<CodeSystemEntityVersion>(`${this.baseUrl}/${id}`);
  }
}
