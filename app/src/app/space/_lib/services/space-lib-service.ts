import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, mergeMap, Observable, timer} from 'rxjs';
import {HttpCacheService, SearchHttpParams, SearchResult} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Space} from '../model/space';
import {Package} from '../model/package';
import {SpaceSearchParams} from 'term-web/space/_lib';
import {SpaceDiff} from '../model/space-diff';
import {JobLibService, LorqueLibService, LorqueProcess} from 'term-web/sys/_lib';

@Injectable()
export class SpaceLibService {
  private cacheService: HttpCacheService;
  protected baseUrl = `${environment.termxApi}/spaces`;

  public constructor(protected http: HttpClient, private lorqueService: LorqueLibService, public jobService: JobLibService) {
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
