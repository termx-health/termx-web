import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import {isDefined} from '@kodality-web/core-util';
import {saveAs} from 'file-saver';
import {distinctUntilChanged, map, Observable} from 'rxjs';
import {Package, PackageVersion, Space, SpaceLibService} from 'term-web/sys/_lib/space';
import {SpaceContextParams, SpaceContextService} from 'term-web/core/context/space-context.service';
import { MarinPageLayoutModule, MuiButtonModule, MuiIconModule, MuiCoreModule, MuiIconButtonModule, MuiDropdownModule } from '@kodality-web/marina-ui';

import { SpaceDrawerSearchComponent } from 'term-web/sys/_lib/space/containers/space-drawer-search.component';
import { TranslatePipe } from '@ngx-translate/core';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';


@Component({
    templateUrl: 'space-context.component.html',
    styleUrls: ['space-context.component.less'],
    imports: [
    MarinPageLayoutModule,
    SpaceDrawerSearchComponent,
    MuiButtonModule,
    RouterLink,
    MuiIconModule,
    MuiCoreModule,
    MuiIconButtonModule,
    MuiDropdownModule,
    RouterOutlet,
    TranslatePipe,
    PrivilegedPipe
],
})
export class SpaceContextComponent implements OnInit {
  private ctx = inject(SpaceContextService);
  private spaceService = inject(SpaceLibService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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
    const name = [this.space?.code, this.pack?.code, this.version?.version].filter(i => isDefined(i)).join('-');
    this.spaceService.overview(this.space?.id, this.pack?.code, this.version?.version).subscribe(resp => {
       saveAs(new Blob([resp.content], {type: 'application/yaml'}), `${name}.yaml`);
    });
  }

  public unselectPackage(): void {
    this.setContext({spaceId: this.space.id});
  }
}
