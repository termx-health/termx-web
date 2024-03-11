import {HttpCacheService, remove} from '@kodality-web/core-util';
import {finalize, map, mergeMap, Observable, Subject, take, timer} from 'rxjs';

export class QueuedCacheService {
  private readonly tick$ = new Subject();
  private valStore = {};
  private cache = new HttpCacheService();
  private httpCache = new HttpCacheService();

  public constructor(private options: {interval?: number, invalidateAfter?: number} = {}) {
    timer(0, options?.interval ?? 50).subscribe(() => this.tick$.next({}));
  }


  public enqueueRequest<Req, Resp, Val>(
    combineKey: string,
    combineVal: Val,
    reqProvider: (combineValues: Val[]) => Observable<Req>,
    respMapper: (resp: Req, val?: Val) => Resp
  ): Observable<Resp> {
    const httpCacheKey = `${combineVal}$${combineKey}`;
    const cachedReq$ = this.httpCache.get<Resp>(httpCacheKey);
    if (cachedReq$) {
      return cachedReq$;
    }

    this.valStore[combineKey] = this.valStore[combineKey] ?? [];
    this.valStore[combineKey].push(combineVal);

    return this.tick$.asObservable().pipe(
      take(1),
      mergeMap(() => {
        const rawReq$ = reqProvider(this.valStore[combineKey]);
        const cachedReq$ = this.cache.put(combineKey, rawReq$);

        const mappedResp$ = cachedReq$.pipe(map(resp => respMapper(resp, combineVal)));
        const httpCacheResp$ = this.httpCache.put(httpCacheKey, mappedResp$);

        return httpCacheResp$.pipe(
          finalize(() => {
            if (this.options.invalidateAfter) {
              setTimeout(() => this.httpCache.remove(httpCacheKey), this.options.invalidateAfter);
            }

            remove(this.valStore[combineKey], combineVal);
            this.cache.remove(combineKey);
          })
        );
      }));
  }
}
