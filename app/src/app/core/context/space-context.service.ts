import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter, forkJoin, Observable, of, ReplaySubject} from 'rxjs';
import {map} from 'rxjs/operators';
import {Package, PackageLibService, PackageVersion, Space, SpaceLibService} from 'term-web/sys/_lib/space';


export class SpaceContext {
  public version?: PackageVersion;
  public pack?: Package;
  public space?: Space;
}

export class SpaceContextParams {
  public s?: number;
  public p?: number;
  public v?: number;
}

@Injectable({providedIn: 'root'})
export class SpaceContextService {
  public context: SpaceContext;
  public params: SpaceContextParams;
  public context$ = new ReplaySubject<SpaceContext>(1);

  public constructor(
    private router: Router,
    private packageService: PackageLibService,
    private spaceService: SpaceLibService
  ) {
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      filter((e: NavigationEnd) => !/\/.+\/context/.test(e.url))
    ).subscribe(() => this.terminate());
  }

  public init(params: SpaceContextParams): Observable<SpaceContext> {
    this.params = params;
    return this.initFromParams(this.params).pipe(map(ctx => this.setContext(ctx)));
  }

  private initFromParams(params: SpaceContextParams): Observable<SpaceContext> {
    if (!params.s) {
      return of(new SpaceContext());
    }
    return forkJoin([
      this.spaceService.load(params.s),
      params.p ? this.packageService.load(params.s, params.p) : of(null),
      params.v ? this.packageService.loadVersion(params.s, params.p, params.v) : of(null)
    ]).pipe(map(([space, pack, version]) => ({version, pack, space})));
  }

  private setContext(ctx: SpaceContext): SpaceContext {
    this.context = ctx;
    this.context$.next(this.context);
    return ctx;
  }

  public terminate(): void {
    this.context = undefined;
    this.context$ = new ReplaySubject<SpaceContext>(1);
    this.params = undefined;
  }

  public static getUrl(url: string, ctx: {spaceId?: number, packageId?: number, versionId?: number}): string {
    const params = {
      v: ctx?.versionId,
      p: ctx?.packageId,
      s: ctx?.spaceId
    };
    return url.replace(
      /context[^\/]*(?=[.?\n\/])/,
      `context;${Object.keys(params).filter(k => !!params[k]).map(k => `${k}=${params[k]}`).join(';')}`
    );
  }
}
