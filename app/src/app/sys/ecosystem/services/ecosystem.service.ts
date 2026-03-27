import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {Ecosystem, EcosystemLibService} from 'term-web/sys/_lib/ecosystem';

@Injectable()
export class EcosystemService extends EcosystemLibService {

  public save(ecosystem: Ecosystem): Observable<Ecosystem> {
    if (ecosystem.id) {
      return this.http.put<Ecosystem>(`${this.baseUrl}/${ecosystem.id}`, ecosystem);
    }
    return this.http.post<Ecosystem>(`${this.baseUrl}`, ecosystem);
  }

  public getEcosystemJsonUrl(ecosystemCode: string): string {
    return `${environment.termxApi}/public/ecosystems/${ecosystemCode}`;
  }

  public downloadEcosystemJson(ecosystemCode: string): Observable<Blob> {
    return this.http.get(`${environment.termxApi}/public/ecosystems/${ecosystemCode}`, {responseType: 'blob'});
  }
}
