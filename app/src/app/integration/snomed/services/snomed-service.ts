import {HttpEvent, HttpEventType, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams} from '@termx-health/core-util';
import {EMPTY, mergeMap, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {SnomedBranch, SnomedCodeSystem, SnomedLibService} from 'term-web/integration/_lib';
import {SnomedRF2FileStats} from 'term-web/integration/snomed/services/snomed-rf2-file-stats';
import {BobObject} from 'term-web/sys/_lib';


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

  public scanRF2(
    request: {
      branchPath: string,
      createCodeSystemVersion: boolean,
      type: string,
      mode?: 'summary' | 'full'
    },
    file: Blob,
    filename?: string
  ): Observable<{finished: boolean, body?: any, progress?: number}> {
    const fd = new FormData();
    fd.append('request', JSON.stringify(request));
    if (file) {
      fd.append('file', file, filename || 'rf2.zip');
    }

    return this.http.post(`${this.baseUrl}/imports/scan`, fd, {
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

  public loadScanResult(lorqueProcessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/imports/scan/result/${lorqueProcessId}`);
  }

  /**
   * Most-recent scan envelope for a Bob archive, server-side keyed by archive uuid.
   * Replaces the previous "envelope via Angular router state" approach which was lost on
   * refresh / back-forward-cache restore and could surface a stale envelope on URL-pasted
   * navigations. Returns {@code null} (HTTP 200 with empty body) when no scan exists yet.
   */
  public loadLatestScanResult(archiveUuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/archives/${archiveUuid}/latest-scan-result`);
  }

  /**
   * Streaming counterpart of {@link createImportJob} — the archive already lives in the Bob
   * "snomed" container (uploaded via {@link BobLibService#upload}). Returns a Lorque process
   * the caller polls for progress / completion.
   */
  public createImportJobFromArchive(request: {
    archiveUuid: string;
    branchPath: string;
    type: string;
    createCodeSystemVersion: boolean;
  }): Observable<{id: number}> {
    return this.http.post(`${this.baseUrl}/imports/from-archive`, request).pipe(map(r => r as {id: number}));
  }

  public scanRF2FromArchive(request: {
    archiveUuid: string;
    branchPath: string;
    type: string;
    mode?: 'summary' | 'full';
  }): Observable<{id: number}> {
    return this.http.post(`${this.baseUrl}/imports/scan/from-archive`, request).pipe(map(r => r as {id: number}));
  }

  public proceedScanImport(cacheId: number): Observable<{jobId: string}> {
    return this.http.post(`${this.baseUrl}/imports/scan/${cacheId}/proceed`, {}).pipe(map(r => r as {jobId: string}));
  }

  /** Per-zip-entry row counts for a SNOMED RF2 archive in Bob — drives the archive detail page's
   *  "Files" panel. Backend: GET /snomed/archives/{uuid}/file-stats. */
  public loadArchiveFileStats(uuid: string): Observable<SnomedRF2FileStats> {
    return this.http.get<SnomedRF2FileStats>(`${this.baseUrl}/archives/${uuid}/file-stats`);
  }

  /** Other archives uploaded against the same branchPath as {@code uuid}, excluding {@code uuid}
   *  itself and any delta archives. Used as the Diff section's baseline picker.
   *  Backend: GET /snomed/archives/{uuid}/diff-candidates  (404 until Phase 2b lands). */
  public loadDiffCandidates(uuid: string): Observable<BobObject[]> {
    return this.http.get<BobObject[]>(`${this.baseUrl}/archives/${uuid}/diff-candidates`);
  }

  /** Kick off the delta-generator run on (this uuid as current, baselineUuid as baseline).
   *  Returns a LorqueProcess the caller polls. Backend: POST /snomed/archives/{uuid}/delta. */
  public calculateDelta(uuid: string, baselineUuid: string): Observable<{id: number}> {
    return this.http.post<{id: number}>(`${this.baseUrl}/archives/${uuid}/delta`, {baselineUuid});
  }

  public findConceptUsage(codes: string[]): Observable<any[]> {
    return this.http.post(`${this.baseUrl}/concept-usage`, {codes}).pipe(map(r => r as any[]));
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
