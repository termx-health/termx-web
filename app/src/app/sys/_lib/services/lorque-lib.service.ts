import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {filter, merge, Observable, Subject, switchMap, takeUntil, tap, timer} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from 'app/src/environments/environment';
import {LorqueProcess} from '../model/lorque-process';

@Injectable()
export class LorqueLibService {

  protected baseUrl = `${environment.terminologyApi}/lorque-processes`;

  public constructor(protected http: HttpClient) { }


  public getStatus(id: number): Observable<string> {
    const url = `${this.baseUrl}/${id}/status`;
    return this.http.get(url).pipe(map(resp => resp['status'] as string));
  }

  public load(id: number): Observable<LorqueProcess> {
    return this.http.get<LorqueProcess>(`${this.baseUrl}/lorque-processes/${id}`);
  }

  public pollFinishedProcess(id: number, destroy$: Observable<any> = timer(60_000)): Observable<string> {
    const stopPolling$ = new Subject<void>();
    return timer(0, 3000).pipe(
      takeUntil(merge(destroy$, stopPolling$)),
      switchMap(() => this.getStatus(id)),
      filter(status => status !== 'running')
    ).pipe(tap(() => stopPolling$.next()));
  }
}
