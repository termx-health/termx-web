import {Injectable} from '@angular/core';
import {EMPTY, mergeMap, Observable, of} from 'rxjs';
import {SnomedBranch, SnomedCodeSystem, SnomedLibService} from 'term-web/integration/_lib';
import {SearchHttpParams} from '@kodality-web/core-util';
import {HttpEvent, HttpEventType, HttpResponse} from '@angular/common/http';


@Injectable()
export class SnomedService extends SnomedLibService {

  public createCodeSystem(cs: SnomedCodeSystem): Observable<SnomedCodeSystem> {
    return this.http.post(`${this.baseUrl}/codesystems`, cs);
  }

  public updateCodeSystem(shortName: string, cs: SnomedCodeSystem): Observable<SnomedCodeSystem> {
    return this.http.put(`${this.baseUrl}/codesystems/${shortName}`, cs);
  }

  public upgradeCodeSystem(shortName: string, newDependantVersion: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/codesystems/${shortName}/upgrade`, {newDependantVersion: newDependantVersion});
  }

  public deleteCodeSystem(shortName: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/codesystems/${shortName}`);
  }

  public createCodeSystemVersion(shortName: string, effectiveDate: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/codesystems/${shortName}/versions`, {effectiveDate: effectiveDate});
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

  public createImportJob(
    request: {
      branchPath: string,
      createCodeSystemVersion: boolean,
      type: string
    },
    file: Blob
  ): Observable<{finished: boolean, body?: {jobId: string}, progress?: number}> {
    const fd = new FormData();
    fd.append('request', JSON.stringify(request));
    if (file) {
      fd.append('file', file, 'files');
    }

    return this.http.post(`${this.baseUrl}/imports`, fd, {
      reportProgress: true,
      observe: 'events'
    }).pipe(mergeMap((event: HttpEvent<any>) => {
      if (event.type === HttpEventType.UploadProgress) {
        return of({finished: false, progress: Math.round(100 * event.loaded / event.total)});
      } else if (event instanceof HttpResponse) {
        return of({finished: true, body: event.body});
      }
      return EMPTY;
    }));
  }

  public deactivateDescription(path: string, descriptionId: string): Observable<any> {
    path = path.split('/').join('--');
    return this.http.post(`${this.baseUrl}/branches/${path}/descriptions/${descriptionId}/deactivate`, {});
  }

  public reactivateDescription(path: string, descriptionId: string): Observable<any> {
    path = path.split('/').join('--');
    return this.http.post(`${this.baseUrl}/branches/${path}/descriptions/${descriptionId}/reactivate`, {});
  }

  public deleteDescription(path: string, descriptionId: string): Observable<any> {
    path = path.split('/').join('--');
    return this.http.delete(`${this.baseUrl}/branches/${path}/descriptions/${descriptionId}`);
  }
}
