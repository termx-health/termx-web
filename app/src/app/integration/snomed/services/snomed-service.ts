import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SnomedBranch, SnomedLibService} from 'term-web/integration/_lib';
import {SearchHttpParams} from '@kodality-web/core-util';


@Injectable()
export class SnomedService extends SnomedLibService {

  public createdBranch(request: any): Observable<SnomedBranch> {
    return this.http.post(`${this.baseUrl}/branches`, request);
  }

  public updateBranch(path: string, request: any): Observable<SnomedBranch> {
    path = path.replace('/', '--');
    return this.http.put(`${this.baseUrl}/branches/${path}`, request);
  }

  public deleteBranch(path: string): Observable<any> {
    path = path.replace('/', '--');
    return this.http.delete(`${this.baseUrl}/branches/${path}`);
  }

  public lockBranch(path: string, message: string): Observable<any> {
    path = path.replace('/', '--');
    return this.http.post(`${this.baseUrl}/branches/${path}/lock`, {}, {params: SearchHttpParams.build({lockMessage: message})});
  }

  public unlockBranch(path: string): Observable<any> {
    path = path.replace('/', '--');
    return this.http.post(`${this.baseUrl}/branches/${path}/unlock`, {});
  }

  public branchIntegrityCheck(path: string): Observable<any> {
    path = path.replace('/', '--');
    return this.http.post(`${this.baseUrl}/branches/${path}/integrity-check`, {});
  }
}
