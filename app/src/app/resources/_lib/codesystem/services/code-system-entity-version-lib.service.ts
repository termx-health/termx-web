import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CodeSystemEntityVersion} from '../../codesystem';
import {environment} from 'environments/environment';

@Injectable()
export class CodeSystemEntityVersionLibService {
  protected baseUrl = `${environment.terminologyApi}/ts/code-system-entity-versions`;

  public constructor(protected http: HttpClient) { }

  public load(id: number): Observable<CodeSystemEntityVersion> {
    return this.http.get<CodeSystemEntityVersion>(`${this.baseUrl}/${id}`);
  }
}
