import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter, mergeMap, Observable, of, ReplaySubject} from 'rxjs';
import {map} from 'rxjs/operators';
import {copyDeep} from '@kodality-web/core-util';
import {Package, PackageLibService, PackageVersion, PackageVersionLibService, Space, SpaceLibService} from 'term-web/space/_lib';


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
    private packageVersionService: PackageVersionLibService,
    private packageService: PackageLibService,
    private spaceService: SpaceLibService
  ) {
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      filter((e: NavigationEnd) => !/\/.+\/context/.test(e.url))
    ).subscribe(() => this.terminate());
  }

  public init(params: SpaceContextParams): Observable<SpaceContext> {
    this.params = SpaceContextService.prioritizeParams(params);
    const getContext = (): Observable<SpaceContext> => {
      if (this.hasNecessaryEntitiesLoaded(this.params)) {
        const primaryParam = Object.keys(this.params)[0];
        const allowedEntities = {v: ['version', 'pack', 'space'], p: ['pack', 'space'], s: ['space']}[primaryParam] || [];
        const _ctx = copyDeep(this.context);
        Object.keys(_ctx).filter(k => !allowedEntities.includes(k)).filter(k => delete _ctx[k]);
        return of(_ctx);
      }
      return this.initFromParams(this.params);
    };

    return getContext().pipe(map(ctx => {
      return this.setContext(ctx);
    }));
  }

  private initFromParams(params: SpaceContextParams): Observable<SpaceContext> {
    if (params.v) {
      return this.initPackageVersion(Number(params.v));
    }
    if (params.p) {
      return this.initPackage(Number(params.p));
    }
    if (params.s) {
      return this.initSpace(Number(params.s));
    }
    return of(new SpaceContext());
  }

  private initPackageVersion(id: number): Observable<SpaceContext> {
    return this.packageVersionService.load(id).pipe(mergeMap(version =>
      (version.packageId ? this.packageService.load(version.packageId) : of(null)).pipe(mergeMap(pack =>
        (pack.spaceId ? this.spaceService.load(pack.spaceId) : of(null)).pipe(map(space => {
          return {version, pack, space};
        }))))));
  }

  private initPackage(id: number): Observable<SpaceContext> {
    return this.packageService.load(id).pipe(mergeMap(pack =>
      (pack.spaceId ? this.spaceService.load(pack.spaceId) : of(null)).pipe(map(space => {
        return {pack, space};
      }))));
  }


  private initSpace(id: number): Observable<SpaceContext> {
    return this.spaceService.load(id).pipe(map(space => {
      return ({space});
    }));
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

  private hasNecessaryEntitiesLoaded(params: SpaceContextParams): boolean {
    const {v, p, s} = params = SpaceContextService.prioritizeParams(params);
    const primaryParam = Object.keys(params)[0];
    const ctx = this.context;

    const checks = {
      v: () => ctx?.version && ctx.version.id == v,
      p: () => ctx?.pack && ctx.pack.id == p,
      s: () => ctx?.space && ctx.space.id == s,
    };
    return checks[primaryParam]?.();
  }


  public static prioritizeParams(params: SpaceContextParams) {
    params ??= {};
    Object.keys(params).filter(k => params[k] === 'undefined').forEach(k => params[k] = undefined);
    const {v, p, s} = params;
    return v ? {v: v}
      : p ? {p: p}
        : s ? {s: s}
          : {};
  }

  public static getUrl(url: string, ctx: {spaceId?: number, packageId?: number, versionId?: number}): string {
    const params = SpaceContextService.prioritizeParams({
      v: ctx?.versionId,
      p: ctx?.packageId,
      s: ctx?.spaceId
    });
    return url.replace(/context[^\/]*(?=[.?\n\/])/, `context${Object.keys(params).map(k => `;${k}=${params[k]}`)}`);
  }
}
