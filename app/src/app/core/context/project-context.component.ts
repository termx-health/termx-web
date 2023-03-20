import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectContextParams, ProjectContextService} from './project-context.service';
import {Package, PackageVersion, Project, ProjectLibService} from '@terminology/core';
import {distinctUntilChanged, map, Observable} from 'rxjs';
import {saveAs} from 'file-saver';
import {isDefined} from '@kodality-web/core-util';


@Component({
  templateUrl: 'project-context.component.html',
  styleUrls: ['project-context.component.less'],
})
export class ProjectContextComponent implements OnInit {
  public loading = true;


  public get params(): ProjectContextParams {
    return this.ctx.params;
  }

  public get version(): PackageVersion {
    return this.ctx.context?.version;
  }

  public get version$(): Observable<PackageVersion> {
    return this.ctx.context$.pipe(map(ctx => ctx.version), distinctUntilChanged());
  }

  public get pack(): Package {
    return this.ctx.context?.pack;
  }

  public get pack$(): Observable<Package> {
    return this.ctx.context$.pipe(map(ctx => ctx.pack), distinctUntilChanged());
  }

  public get project(): Project {
    return this.ctx.context?.project;
  }

  public get project$(): Observable<Project> {
    return this.ctx.context$.pipe(map(ctx => ctx.project), distinctUntilChanged());
  }

  public constructor(
    public ctx: ProjectContextService,
    public projectService: ProjectLibService,
    private route: ActivatedRoute,
    private router: Router) {}


  public ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loading = true;
      this.ctx.init({...params}).subscribe(({version, pack, project}) => {
        this.setContext({versionId: version?.id, packageId: pack?.id, projectId: project?.id});
      }).add(() => this.loading = false);
    });
  }

  public setContext(ctx: {projectId?: number, packageId?: number, versionId?: number}): void {
    const url = ProjectContextService.getUrl(this.router.url, ctx);
    this.router.navigateByUrl(url,{replaceUrl: true});
  }

  public downloadYaml(): void {
    const request = {projectCode: this.project?.code, packageCode: this.pack?.code, version: this.version?.version};
    const name = [request.projectCode, request.packageCode, request.version].filter(i => isDefined(i)).join('-');
    this.projectService.overview(request).subscribe(resp => {
       saveAs(new Blob([resp.content], {type: 'application/yaml'}), `${name}.yaml`);
    });
  }

  public unselectPackage(): void {
    this.setContext({projectId: this.project.id});
  }
}
