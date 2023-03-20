import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API_URL} from '../../../terminology-lib.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ValueSetVersion} from '../model/value-set-version';

@Injectable()
export class ValueSetVersionLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API_URL) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/value-set-versions`;
  }

  public load(id: number): Observable<ValueSetVersion> {
    return this.http.get<ValueSetVersion>(`${this.baseUrl}/${id}`);
  }
}
