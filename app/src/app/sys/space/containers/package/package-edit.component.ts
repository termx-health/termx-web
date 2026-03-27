import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import { collect, copyDeep, group, isDefined, validateForm, ApplyPipe } from '@kodality-web/core-util';
import {saveAs} from 'file-saver';
import {forkJoin} from 'rxjs';
import {Package, PackageResource, PackageVersion, ServerLibService} from 'term-web/sys/_lib/space';
import {PackageService} from 'term-web/sys/space/services/package.service';
import {SpaceService} from 'term-web/sys/space/services/space.service';
import { MuiFormModule, MuiCardModule, MuiButtonModule, MuiCoreModule, MuiIconModule, MuiTooltipModule, MuiPopconfirmModule, MuiInputModule, MuiDividerModule } from '@kodality-web/marina-ui';
import { NzTimelineComponent, NzTimelineItemComponent } from 'ng-zorro-antd/timeline';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { MapSetSearchComponent } from 'term-web/resources/_lib/map-set/containers/map-set-search.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: './package-edit.component.html',
    imports: [
    MuiFormModule,
    MuiCardModule,
    MuiButtonModule,
    NzTimelineComponent,
    NzTimelineItemComponent,
    MuiCoreModule,
    MuiIconModule,
    MuiTooltipModule,
    MuiPopconfirmModule,
    FormsModule,
    MuiInputModule,
    MuiDividerModule,
    CodeSystemSearchComponent,
    ValueSetSearchComponent,
    MapSetSearchComponent,
    TranslatePipe,
    ApplyPipe
],
})
export class PackageEditComponent implements OnInit {
  private spaceService = inject(SpaceService);
  private packageService = inject(PackageService);
  private serverService = inject(ServerLibService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  public package?: Package;
  public version?: PackageVersion;
  public versions?: PackageVersion[];
  public spaceId?: number;

  public loading = false;
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.spaceId = Number(this.route.snapshot.paramMap.get('spaceId'));
    this.mode = id ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadPackage(Number(id));
    } else {
      this.package = new Package();
      this.addVersion();
    }
  }

  private loadPackage(id: number): void {
    this.loading = true;
    forkJoin([
      this.packageService.load(this.spaceId, id),
      this.packageService.loadVersions(this.spaceId, id)
    ]).subscribe(([p, versions]) => {
      this.package = p;
      this.versions = versions;
      if (this.versions.length > 0) {
        this.version = this.versions[this.versions.length - 1];
      } else {
        this.addVersion();
      }
    }).add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.package.status ??= 'draft';
    this.spaceService.savePackage({pack: this.package, version: this.version}, this.spaceId)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }

  public duplicateVersion(v: PackageVersion): void {
    const newVersion: PackageVersion = copyDeep(v);
    newVersion.id = undefined;
    newVersion.version = undefined;
    this.versions = [...this.versions || [], newVersion];
    this.version = newVersion;
  }

  public deleteVersion(id: number): void {
    this.loading = true;
    this.packageService.deleteVersion(this.spaceId, this.package.id, id)
      .subscribe(() => this.loadPackage(this.package.id)).add(() => this.loading = false);
  }

  public removeVersion(index: number): void {
    this.versions.splice(index, 1);
    this.versions = [...this.versions];
    if (!this.versions.includes(this.version)) {
      this.version = this.versions[this.versions.length - 1];
    }
  }

  public selectVersion(version: PackageVersion): void {
    this.version = version;
  }

  public addVersion(): void {
    const newVersion: PackageVersion = {resources: []};
    this.versions = [...this.versions || [], newVersion];
    this.version = newVersion;
  }

  public get newVersionExists(): boolean {
    return !!this.versions?.find(v => !v.id);
  }

  public groupResources = (resources: PackageResource[]): {[key: string]: string[]} => {
    return  resources && collect(resources, r => r.resourceType, r => r.resourceId) || {};
  };

  public addResource = (resources: string[], type: string): void => {
    const current: {[key: string]: PackageResource} = group((this.version.resources || []).filter(r => r.resourceType === type), r => r.resourceId);
    this.version.resources = [
      ...(this.version.resources || []).filter(r => r.resourceType !== type),
      ...(resources || []).map(r => ({id: current[r]?.id, resourceId: r, resourceType: type, terminologyServer: current[r]?.terminologyServer}))
    ];
  };

  public downloadYaml(version: PackageVersion): void {
    if (!version) {
      return;
    }
    this.spaceService.load(this.spaceId).subscribe(space => {
      const name = [space.code, this.package.code, version.version].filter(i => isDefined(i)).join('-');
      this.spaceService.overview(space.id, this.package.code, version.version).subscribe(resp => {
        saveAs(new Blob([resp.content], {type: 'application/yaml'}), `${name}.yaml`);
      });
    });
  }
}
