import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { LoadingManager, LocalDatePipe, LocalDateTimePipe, ToStringPipe } from '@termx-health/core-util';
import {CodeSystem, CodeSystemConcept, CodeSystemEntityVersion, CodeSystemVersion} from 'term-web/resources/_lib';
import {forkJoin, of} from 'rxjs';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule, MuiCardModule, MuiListModule, MuiDividerModule } from '@termx-health/ui';

import { FormsModule } from '@angular/forms';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { ResourceRelatedArtifactWidgetComponent } from 'term-web/resources/resource/components/resource-related-artifact-widget.component';
import { CodeSystemDesignationEditComponent } from 'term-web/resources/code-system/containers/concepts/edit/designation/code-system-designation-edit.component';
import { CodeSystemPropertyValueEditComponent } from 'term-web/resources/code-system/containers/concepts/edit/propertyvalue/code-system-property-value-edit.component';
import { CodeSystemAssociationEditComponent } from 'term-web/resources/code-system/containers/concepts/edit/association/code-system-association-edit.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@termx-health/util';

@Component({
    templateUrl: './code-system-concept-view.component.html',
    styles: [`
    .version-sidebar {
      height: min-content;
      margin-bottom: 1rem
    }

    .padded {
      display: block;
      margin-top: 1rem
    }
  `],
    imports: [ResourceContextComponent, MarinPageLayoutModule, MuiCardModule, MuiListModule, FormsModule, MuiDividerModule, StatusTagComponent, ResourceRelatedArtifactWidgetComponent, CodeSystemDesignationEditComponent, CodeSystemPropertyValueEditComponent, CodeSystemAssociationEditComponent, TranslatePipe, MarinaUtilModule, LocalDatePipe, LocalDateTimePipe, ToStringPipe]
})
export class CodeSystemConceptViewComponent implements OnInit {
  private codeSystemService = inject(CodeSystemService);
  private route = inject(ActivatedRoute);

  public codeSystemId?: string | null;
  public versionCode?: string | null;
  public parent?: string | null;
  public codeSystem?: CodeSystem;
  public codeSystemVersion?: CodeSystemVersion;
  public codeSystemVersions?: CodeSystemVersion[];
  public concept?: CodeSystemConcept;
  public conceptVersion?: CodeSystemEntityVersion;

  protected loader = new LoadingManager();

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.versionCode = this.route.snapshot.paramMap.get('versionCode');
    const conceptCode = this.route.snapshot.paramMap.get('conceptCode') ? decodeURIComponent(this.route.snapshot.paramMap.get('conceptCode')) : undefined;
    const conceptVersionId = this.route.snapshot.queryParamMap.get('conceptVersionId');

    this.loadData();

    this.loader.wrap('init', this.codeSystemService.loadConcept(this.codeSystemId, conceptCode, this.versionCode)).subscribe(c => {
      this.concept = c;
      const conceptVersion = this.concept?.versions?.find(v => v.id === Number(conceptVersionId)) || this.concept?.versions?.[this.concept?.versions?.length - 1];
      this.selectVersion(conceptVersion);
    });
  }

  public selectVersion(version?: CodeSystemEntityVersion): void {
    version.designations ??= [];
    version.propertyValues ??= [];
    version.associations ??= [];
    this.conceptVersion = version;
  }

  private loadData(): void {
    this.loader.wrap('init', forkJoin([
      this.codeSystemService.load(this.codeSystemId),
      this.versionCode ? this.codeSystemService.loadVersion(this.codeSystemId, this.versionCode) : of(undefined),
      !this.versionCode ? this.codeSystemService.searchVersions(this.codeSystemId, {limit: -1}) : of({data: []})]
    )).subscribe(([cs, version, versions]) => {
      this.codeSystem = cs;
      this.codeSystemVersion = version;
      this.codeSystemVersions = versions.data;
    });
  }
}
