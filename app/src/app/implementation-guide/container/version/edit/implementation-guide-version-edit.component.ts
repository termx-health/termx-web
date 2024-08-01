import {Location} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ImplementationGuideVersion} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideVersionFormComponent} from 'term-web/implementation-guide/container/version/edit/implementation-guide-version-form.component';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';


@Component({
  templateUrl: 'implementation-guide-version-edit.component.html',
})
export class ImplementationGuideVersionEditComponent implements OnInit {
  protected ig?: string | null;
  protected version?: ImplementationGuideVersion;
  protected versions?: ImplementationGuideVersion[];
  protected loader = new LoadingManager();
  protected mode: 'add' | 'edit' = 'add';

  @ViewChild(ImplementationGuideVersionFormComponent) public versionFormComponent?: ImplementationGuideVersionFormComponent;

  public constructor(
    private igService: ImplementationGuideService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.ig = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');

    if (isDefined(versionCode)) {
      this.mode = 'edit';
      this.loader.wrap('load', this.igService.loadVersion(this.ig, versionCode)).subscribe(v => this.version = this.writeVersion(v));
    } else {
      this.version = this.writeVersion(new ImplementationGuideVersion());
    }

    this.igService.searchVersions(this.ig, {limit: -1}).subscribe(r => this.versions = r.data);
  }

  public save(): void {
    if (!validateForm(this.versionFormComponent.form)) {
      return;
    }
    const version = this.versionFormComponent.getVersion();
    this.loader.wrap('save', this.igService.saveVersion(this.ig, version)).subscribe(() => this.location.back());
  }

  private writeVersion(version: ImplementationGuideVersion): ImplementationGuideVersion {
    version.status ??= 'draft';
    version.template ??= 'local-template';
    version.dependsOn ??= [];
    version.github ??= {};
    return version;
  }

}
