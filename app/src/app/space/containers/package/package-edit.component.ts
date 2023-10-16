import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {collect, copyDeep, group, isDefined, validateForm} from '@kodality-web/core-util';
import {Package, PackageResource, PackageVersion, TerminologyServerLibService} from 'term-web/space/_lib';
import {SpaceService} from '../../services/space.service';
import {forkJoin} from 'rxjs';
import {saveAs} from 'file-saver';
import {PackageService} from 'term-web/space/services/package.service';

@Component({
  templateUrl: './package-edit.component.html',
})
export class PackageEditComponent implements OnInit {
  public package?: Package;
  public version?: PackageVersion;
  public versions?: PackageVersion[];
  public spaceId?: number;

  public loading = false;
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private spaceService: SpaceService,
    private packageService: PackageService,
    private terminologyServerService: TerminologyServerLibService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

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

  public addResource = (resources: string[], type: string) => {
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
