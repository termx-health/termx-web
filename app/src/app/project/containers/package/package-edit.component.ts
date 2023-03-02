import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {collect, validateForm, group, isDefined, copyDeep} from '@kodality-web/core-util';
import {Package, PackageLibService, PackageResource, PackageVersion, TerminologyServer, TerminologyServerLibService} from 'terminology-lib/project';
import {ProjectService} from '../../services/project.service';
import {forkJoin} from 'rxjs';
import {saveAs} from 'file-saver';
import {PackageService} from '../../services/package.service';
import {PackageVersionService} from '../../services/package-version.service';

@Component({
  templateUrl: './package-edit.component.html',
})
export class PackageEditComponent implements OnInit {
  public package?: Package;
  public version?: PackageVersion;
  public versions?: PackageVersion[];
  public terminologyServers?: TerminologyServer[];
  public projectId?: number;

  public loading = false;
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private projectService: ProjectService,
    private packageService: PackageLibService,
    private packageVersionService: PackageVersionService,
    private terminologyServerService: TerminologyServerLibService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.loadTerminologyServers(this.projectId);
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
    forkJoin([this.packageService.load(id), this.packageService.loadVersions(id)]).subscribe(([p, versions]) => {
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
    this.projectService.savePackage({pack: this.package, version: this.version}, this.projectId)
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
    this.packageVersionService.delete(id).subscribe(() => this.loadPackage(this.package.id)).add(() => this.loading = false);
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

  public groupResources = (resources: PackageResource[], servers: TerminologyServer[]): {[key: string]: {[key: string]: string[]}} => {
    const collectedByServer: {[key: string]: PackageResource[]} = resources && collect(resources, r => r.terminologyServer, r => r) || {};
    const collected: {[key: string]: {[key: string]: string[]}} = {};
    servers?.forEach(server => {
      collected[server.code] = collectedByServer[server.code] ? collect(collectedByServer[server.code], r => r.resourceType, r => r.resourceId) : {};
    });
    return collected;
  };

  public addResource = (resources: string[], type: string, server: string) => {
    const current: {[key: string]: PackageResource} = group((this.version.resources || []).filter(r => r.resourceType === type && r.terminologyServer === server), r => r.resourceId);
    this.version.resources = [
      ...(this.version.resources || []).filter(r => r.resourceType !== type || r.terminologyServer !== server),
      ...(resources || []).map(r => ({id: current[r]?.id, resourceId: r, resourceType: type, terminologyServer: server}))
    ];
  };

  private loadTerminologyServers(projectId: number): void {
    forkJoin([
      this.terminologyServerService.search({projectId: projectId, limit: -1}),
      this.terminologyServerService.search({currentInstallation: true, limit: 1})
    ]).subscribe(([projectServers, currentInstallation]) => {
      this.terminologyServers = [...new Map([...projectServers.data, ...currentInstallation.data].map(s => [s.id, s])).values()];
      this.version.resources = [...this.version.resources.filter(r => this.terminologyServers.map(ts => ts.code).includes(r.terminologyServer))];
    });
  }

  public downloadYaml(version: PackageVersion): void {
    if (!version) {
      return;
    }
    this.projectService.load(this.projectId).subscribe(project => {
      const request = {projectCode: project.code, packageCode: this.package.code, version: version.version};
      const name = [request.projectCode, request.packageCode, request.version].filter(i => isDefined(i)).join('-');
      this.projectService.overview(request).subscribe(resp => {
        saveAs(new Blob([resp.content], {type: 'application/yaml'}), `${name}.yaml`);
      });
    });
  }
}
