import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {HttpCacheService, SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {map, mergeMap, Observable, timer} from 'rxjs';
import {SpaceSearchParams} from 'term-web/sys/_lib/space';
import {JobLibService, LorqueLibService, LorqueProcess} from 'term-web/sys/_lib';
import {Package} from 'term-web/sys/_lib/space/model/package';
import {Space} from 'term-web/sys/_lib/space/model/space';
import {SpaceDiff} from 'term-web/sys/_lib/space/model/space-diff';

@Injectable()
export class SpaceLibService {
  protected http = inject(HttpClient);
  private lorqueService = inject(LorqueLibService);
  protected jobService = inject(JobLibService);

  private cacheService: HttpCacheService;
  protected baseUrl = `${environment.termxApi}/spaces`;

  public constructor() {
    this.cacheService = new HttpCacheService();
  }

  public load(id: number): Observable<Space> {
    return this.http.get<Space>(`${this.baseUrl}/${id}`);
  }

  public loadPackages(id: number): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.baseUrl}/${id}/packages`);
  }

  public search(params: SpaceSearchParams): Observable<SearchResult<Space>> {
    return this.http.get<SearchResult<Space>>(`${this.baseUrl}`, {params: SearchHttpParams.build(params)});
  }

  public overview(spaceId: number, packageCode: string, version: string): Observable<{content: string}> {
    return this.http.get<{content: string}>(`${this.baseUrl}/${spaceId}/overview`, {params: SearchHttpParams.build({packageCode, version})});
  }

  public diff(spaceId: number, packageCode: string, version: string, destroy$: Observable<any> = timer(60_000), clearCache?: boolean): Observable<SpaceDiff> {
    const key = `${spaceId}#${packageCode}#${version}`;
    if (clearCache) {
      this.cacheService.remove(key);
    }
    return this.cacheService.put(key, this.http.get<LorqueProcess>(`${this.baseUrl}/${spaceId}/diff`, {params: SearchHttpParams.build({packageCode, version})})
          .pipe(mergeMap(process => this.lorqueService.pollFinishedProcess(process.id, destroy$)
            .pipe(mergeMap(status => this.lorqueService.load(process.id)
              .pipe(map(p => status === 'failed' ? {error: p.resultText} :  JSON.parse(p.resultText))))))));
  }

}
