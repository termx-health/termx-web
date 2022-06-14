import {Observable, shareReplay} from 'rxjs';

export class CacheService {
  private cache: {[key: string]: Observable<any>} = {};

  public getCachedResponse(key: string, request: Observable<any>): Observable<any> {
      if (!this.cache[key]) {
      this.cache[key] = request.pipe(shareReplay(1));
    }
    return this.cache[key];
  }

}
