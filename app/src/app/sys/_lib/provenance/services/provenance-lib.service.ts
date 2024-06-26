import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Provenance} from '../model/provenance';

@Injectable()
export class ProvenanceLibService {
  protected baseUrl = `${environment.termxApi}/provenances`;

  public constructor(protected http: HttpClient) { }

  public query(target: string): Observable<Provenance[]> {
    return this.http.get<Provenance[]>(`${this.baseUrl}`, {params: SearchHttpParams.build({target: target})});
  }
}
