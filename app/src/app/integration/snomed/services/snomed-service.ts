import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SnomedBranch, SnomedCodeSystem, SnomedLibService} from 'term-web/integration/_lib';
import {SearchHttpParams} from '@kodality-web/core-util';


@Injectable()
export class SnomedService extends SnomedLibService {

  public createdCodeSystem(cs: SnomedCodeSystem): Observable<SnomedCodeSystem> {
    return this.http.post(`${this.baseUrl}/codesystems`, cs);
  }

  public updateCodeSystem(shortName: string, cs: SnomedCodeSystem): Observable<SnomedCodeSystem> {
    return this.http.put(`${this.baseUrl}/codesystems/${shortName}`, cs);
  }
  public upgradeCodeSystem(shortName: string, newDependantVersion: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/codesystems/${shortName}/upgrade`, {newDependantVersion: newDependantVersion});
  }

  public startNewAuthoringCycle(shortName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/codesystems/${shortName}/new-authoring-cycle`, {});
  }

  public deleteCodeSystem(shortName: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/codesystems/${shortName}`);
  }

  public createdBranch(request: any): Observable<SnomedBranch> {
    return this.http.post(`${this.baseUrl}/branches`, request);
  }

  public updateBranch(path: string, request: any): Observable<SnomedBranch> {
    path = path.split('/').join('--');
    return this.http.put(`${this.baseUrl}/branches/${path}`, request);
  }

  public deleteBranch(path: string): Observable<any> {
    path = path.split('/').join('--');
    return this.http.delete(`${this.baseUrl}/branches/${path}`);
  }

  public lockBranch(path: string, message: string): Observable<any> {
    path = path.split('/').join('--');
    return this.http.post(`${this.baseUrl}/branches/${path}/lock`, {}, {params: SearchHttpParams.build({lockMessage: message})});
  }

  public unlockBranch(path: string): Observable<any> {
    path = path.split('/').join('--');
    return this.http.post(`${this.baseUrl}/branches/${path}/unlock`, {});
  }

  public branchIntegrityCheck(path: string): Observable<any> {
    path = path.split('/').join('--');
    return this.http.post(`${this.baseUrl}/branches/${path}/integrity-check`, {});
  }

  public createExportJob(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/exports`, request);
  }

  public createImportJob(request: any, file: Blob): Observable<any> {
    const fd = new FormData();
    fd.append('request', JSON.stringify(request));
    if (file) {
      fd.append('file', file, 'files');
    }
    return this.http.post(`${this.baseUrl}/imports`, fd);
  }

  public deleteDescription(path: string, descriptionId: string): Observable<any> {
    path = path.split('/').join('--');
    return this.http.delete(`${this.baseUrl}/branches/${path}/descriptions/${descriptionId}`);
  }
}
