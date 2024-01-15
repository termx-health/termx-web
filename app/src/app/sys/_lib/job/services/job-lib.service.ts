import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {merge, Observable, Subject, switchMap, take, takeUntil, timer} from 'rxjs';
import {environment} from 'app/src/environments/environment';
import {JobLog} from '../model/job-log';

@Injectable()
export class JobLibService {
  protected baseUrl = `${environment.termxApi}/job-logs`;

  public constructor(protected http: HttpClient) { }

  public getLog(jobId: number): Observable<JobLog> {
    return this.http.get<JobLog>(`${this.baseUrl}/${jobId}`);
  }

  public pollFinishedJobLog = (jobId: number, destroy$: Observable<any> = timer(60_000)): Observable<JobLog> => {
    const pollComplete$ = new Subject();

    timer(0, 3000).pipe(
      switchMap(() => this.getLog(jobId)),
      takeUntil(merge(pollComplete$, destroy$))
    ).subscribe(resp => {
      if (resp.execution?.status !== 'running') {
        pollComplete$.next(resp);
      }
    });

    return pollComplete$.pipe(take(1));
  };
}
