import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API_URL} from '../../../terminology-lib.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CodeSystemEntityVersion} from '../model/code-system-entity';

@Injectable()
export class CodeSystemEntityVersionLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API_URL) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/code-system-entity-versions`;
  }

  public load(id: number): Observable<CodeSystemEntityVersion> {
    return this.http.get<CodeSystemEntityVersion>(`${this.baseUrl}/${id}`);
  }
}
