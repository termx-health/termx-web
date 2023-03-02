import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter, mergeMap, Observable, of, ReplaySubject} from 'rxjs';
import {map} from 'rxjs/operators';
import {copyDeep} from '@kodality-web/core-util';
import {Package, PackageLibService, PackageVersion, PackageVersionLibService, Project, ProjectLibService} from 'terminology-lib/project';


export class ProjectContext {
  public version?: PackageVersion;
  public pack?: Package;
  public project?: Project;
}

export class ProjectContextParams {
  public pr?: number;
  public p?: number;
  public v?: number;
}

@Injectable({providedIn: 'root'})
export class ProjectContextService {
  public context: ProjectContext;
  public params: ProjectContextParams;
  public context$ = new ReplaySubject<ProjectContext>(1);

  public constructor(
    private router: Router,
    private packageVersionService: PackageVersionLibService,
    private packageService: PackageLibService,
    private projectService: ProjectLibService
  ) {
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      filter((e: NavigationEnd) => !/\/.+\/context/.test(e.url))
    ).subscribe(() => this.terminate());
  }

  public init(params: ProjectContextParams): Observable<ProjectContext> {
    this.params = ProjectContextService.prioritizeParams(params);
    const getContext = (): Observable<ProjectContext> => {
      if (this.hasNecessaryEntitiesLoaded(this.params)) {
        const primaryParam = Object.keys(this.params)[0];
        const allowedEntities = {v: ['version', 'pack', 'project'], p: ['pack', 'project'], pr: ['project']}[primaryParam] || [];
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

  private initFromParams(params: ProjectContextParams): Observable<ProjectContext> {
    if (params.v) {
      return this.initPackageVersion(Number(params.v));
    }
    if (params.p) {
      return this.initPackage(Number(params.p));
    }
    if (params.pr) {
      return this.initProject(Number(params.pr));
    }
    return of(new ProjectContext());
  }

  private initPackageVersion(id: number): Observable<ProjectContext> {
    return this.packageVersionService.load(id).pipe(mergeMap(version =>
      (version.packageId ? this.packageService.load(version.packageId) : of(null)).pipe(mergeMap(pack =>
        (pack.projectId ? this.projectService.load(pack.projectId) : of(null)).pipe(map(project => {
          return {version, pack, project};
        }))))));
  }

  private initPackage(id: number): Observable<ProjectContext> {
    return this.packageService.load(id).pipe(mergeMap(pack =>
      (pack.projectId ? this.projectService.load(pack.projectId) : of(null)).pipe(map(project => {
        return {pack, project};
      }))));
  }


  private initProject(id: number): Observable<ProjectContext> {
    return this.projectService.load(id).pipe(map(project => {
      return ({project});
    }));
  }

  private setContext(ctx: ProjectContext): ProjectContext {
    this.context = ctx;
    this.context$.next(this.context);
    return ctx;
  }

  public terminate(): void {
    this.context = undefined;
    this.context$ = new ReplaySubject<ProjectContext>(1);
    this.params = undefined;
  }

  private hasNecessaryEntitiesLoaded(params: ProjectContextParams): boolean {
    const {v, p, pr} = params = ProjectContextService.prioritizeParams(params);
    const primaryParam = Object.keys(params)[0];
    const ctx = this.context;

    const checks = {
      v: () => ctx?.version && ctx.version.id == v,
      p: () => ctx?.pack && ctx.pack.id == p,
      pr: () => ctx?.project && ctx.project.id == pr,
    };
    return checks[primaryParam]?.();
  }


  public static prioritizeParams(params: ProjectContextParams) {
    params ??= {};
    Object.keys(params).filter(k => params[k] === 'undefined').forEach(k => params[k] = undefined);
    const {v, p, pr} = params;
    return v ? {v: v}
      : p ? {p: p}
        : pr ? {pr: pr}
          : {};
  }

  public static getUrl(url: string, ctx: {projectId?: number, packageId?: number, versionId?: number}): string {
    const params = ProjectContextService.prioritizeParams({
      v: ctx?.versionId,
      p: ctx?.packageId,
      pr: ctx?.projectId
    });
    return url.replace(/context[^\/]*/, `context${Object.keys(params).map(k => `;${k}=${params[k]}`)}`);
  }
}
