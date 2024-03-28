import {Injectable} from '@angular/core';
import {mergeMap, Observable, timer} from 'rxjs';
import {Package, PackageVersion, Space, SpaceLibService} from 'term-web/space/_lib';
import {JobLog, JobLogResponse} from 'term-web/sys/_lib';

@Injectable()
export class SpaceService extends SpaceLibService {

  public save(space: Space): Observable<Space> {
    if (space.id) {
      return this.http.put<Space>(`${this.baseUrl}/${space.id}`, space);
    }
    return this.http.post<Space>(`${this.baseUrl}`, space);
  }

  public savePackage(req: {pack: Package, version: PackageVersion}, spaceId: number): Observable<Package> {
    return this.http.post<Space>(`${this.baseUrl}/${spaceId}/packages`, req);
  }

  public import(file: File): Observable<JobLogResponse> {
    const formdata: FormData = new FormData();
    formdata.append('file', file as Blob);
    return this.http.post<JobLogResponse>(`${this.baseUrl}/sync`, formdata);
  }

  public sync(spaceId: number, packageCode: string, version: string, destroy$: Observable<any> = timer(60_000), clearSync?: boolean): Observable<JobLog> {
    return this.http.post<JobLogResponse>(`${this.baseUrl}/${spaceId}/sync`, {packageCode: packageCode, version: version, clearSync: clearSync})
      .pipe(mergeMap(resp => this.jobService.pollFinishedJobLog(resp.jobId, destroy$)
        .pipe(mergeMap(jobLog => this.jobService.getLog(jobLog.id)))));
  }

}
