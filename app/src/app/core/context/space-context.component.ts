import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {isDefined} from '@kodality-web/core-util';
import {saveAs} from 'file-saver';
import {distinctUntilChanged, map, Observable} from 'rxjs';
import {Package, PackageVersion, Space, SpaceLibService} from 'term-web/sys/_lib/space';
import {SpaceContextParams, SpaceContextService} from './space-context.service';


@Component({
  templateUrl: 'space-context.component.html',
  styleUrls: ['space-context.component.less'],
})
export class SpaceContextComponent implements OnInit {
  public loading = true;


  public get params(): SpaceContextParams {
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

  public get space(): Space {
    return this.ctx.context?.space;
  }

  public get space$(): Observable<Space> {
    return this.ctx.context$.pipe(map(ctx => ctx.space), distinctUntilChanged());
  }

  public constructor(
    public ctx: SpaceContextService,
    public spaceService: SpaceLibService,
    private route: ActivatedRoute,
    private router: Router) {}


  public ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loading = true;
      this.ctx.init({...params}).subscribe(({version, pack, space}) => {
        this.setContext({versionId: version?.id, packageId: pack?.id, spaceId: space?.id});
      }).add(() => this.loading = false);
    });
  }

  public setContext(ctx: {spaceId?: number, packageId?: number, versionId?: number}): void {
    const url = SpaceContextService.getUrl(this.router.url, ctx);
    this.router.navigateByUrl(url,{replaceUrl: true});
  }

  public downloadYaml(): void {
    const request = {spaceCode: this.space?.code, packageCode: this.pack?.code, version: this.version?.version};
    const name = [this.space?.code, this.pack?.code, this.version?.version].filter(i => isDefined(i)).join('-');
    this.spaceService.overview(this.space?.id, this.pack?.code, this.version?.version).subscribe(resp => {
       saveAs(new Blob([resp.content], {type: 'application/yaml'}), `${name}.yaml`);
    });
  }

  public unselectPackage(): void {
    this.setContext({spaceId: this.space.id});
  }
}
