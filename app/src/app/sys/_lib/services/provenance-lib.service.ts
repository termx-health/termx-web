import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'app/src/environments/environment';
import {Provenance} from '../../_lib';
import {SearchHttpParams} from '@kodality-web/core-util';

@Injectable()
export class ProvenanceLibService {
  protected baseUrl = `${environment.termxApi}/provenances`;

  public constructor(protected http: HttpClient) { }

  public query(target: string): Observable<Provenance[]> {
    return this.http.get<Provenance[]>(`${this.baseUrl}`, {params: SearchHttpParams.build({target: target})});
  }
}
