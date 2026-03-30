import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {isDefined, LoadingManager, validateForm} from '@termx-health/core-util';
import {ImplementationGuideVersion} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideVersionFormComponent} from 'term-web/implementation-guide/container/version/edit/implementation-guide-version-form.component';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiButtonModule } from '@termx-health/ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { ImplementationGuideVersionFormComponent as ImplementationGuideVersionFormComponent_1 } from 'term-web/implementation-guide/container/version/edit/implementation-guide-version-form.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: 'implementation-guide-version-edit.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    StatusTagComponent,
    ImplementationGuideVersionFormComponent_1,
    MuiButtonModule,
    TranslatePipe
],
})
export class ImplementationGuideVersionEditComponent implements OnInit {
  private igService = inject(ImplementationGuideService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  protected ig?: string | null;
  protected version?: ImplementationGuideVersion;
  protected versions?: ImplementationGuideVersion[];
  protected loader = new LoadingManager();
  protected mode: 'add' | 'edit' = 'add';

  @ViewChild(ImplementationGuideVersionFormComponent) public versionFormComponent?: ImplementationGuideVersionFormComponent;

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
