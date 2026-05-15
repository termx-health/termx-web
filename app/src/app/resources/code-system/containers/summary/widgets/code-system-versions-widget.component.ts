import { Component, EventEmitter, Input, Output, ViewChild, OnChanges, SimpleChanges, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoadingManager, validateForm, collect, ApplyPipe, JoinPipe, LocalDatePipe, SortPipe } from '@termx-health/core-util';
import { LocalizedName, MarinaUtilModule } from '@termx-health/util';
import {CodeSystemVersion} from 'term-web/resources/_lib';
import {AuthService} from 'term-web/core/auth';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {ResourceReleaseModalComponent} from 'term-web/resources/resource/components/resource-release-modal-component';
import {ValueSetVersionSaveModalComponent} from 'term-web/resources/value-set/components/value-set-version-save-modal-component';
import {Release, ReleaseLibService} from 'term-web/sys/_lib';

import { MuiNoDataModule, MuiListModule, MuiDividerModule, MuiCoreModule, MuiDropdownModule, MuiIconModule, MuiPopconfirmModule, MuiModalModule, MarinPageLayoutModule, MuiFormModule, MuiButtonModule } from '@termx-health/ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import { ResourceReleaseModalComponent as ResourceReleaseModalComponent_1 } from 'term-web/resources/resource/components/resource-release-modal-component';
import { ValueSetVersionSaveModalComponent as ValueSetVersionSaveModalComponent_1 } from 'term-web/resources/value-set/components/value-set-version-save-modal-component';
import { TranslatePipe } from '@ngx-translate/core';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    selector: 'tw-code-system-versions-widget',
    templateUrl: 'code-system-versions-widget.component.html',
    imports: [MuiNoDataModule, MuiListModule, MuiDividerModule, MuiCoreModule, StatusTagComponent, PrivilegedDirective, MuiDropdownModule, MuiIconModule, MuiPopconfirmModule, RouterLink, MuiModalModule, MarinPageLayoutModule, FormsModule, MuiFormModule, SemanticVersionSelectComponent, MuiButtonModule, ResourceReleaseModalComponent_1, ValueSetVersionSaveModalComponent_1, TranslatePipe, MarinaUtilModule, ApplyPipe, JoinPipe, LocalDatePipe, SortPipe, HasAnyPrivilegePipe, PrivilegedPipe]
})
export class CodeSystemVersionsWidgetComponent implements OnChanges {
  private router = inject(Router);
  private codeSystemService = inject(CodeSystemService);
  private releaseService = inject(ReleaseLibService);
  private authService = inject(AuthService);

  @Input() public codeSystem: string;
  @Input() public codeSystemTitle: LocalizedName;
  @Input() public codeSystemValueSet: string;
  @Input() public versions: CodeSystemVersion[];
  @Output() public versionsChanged: EventEmitter<void> = new EventEmitter();

  protected releases: {[key: string]: Release[]};
  protected loader = new LoadingManager();
  protected openVersionBlocked: boolean;

  protected duplicateModalData: {
    visible?: boolean,
    version?: string,
    targetVersion?: string
  } = {};
  @ViewChild("duplicateModalForm") public duplicateModalForm?: NgForm;
  @ViewChild("releaseModal") public releaseModal?: ResourceReleaseModalComponent;
  @ViewChild("valueSetModal") public valueSetModal?: ValueSetVersionSaveModalComponent;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystem'] && this.codeSystem) {
      this.loadRelease();
    }
  }

  protected openVersionSummary(version: string): void {
    if (this.openVersionBlocked) {
      return;
    }
    this.router.navigate(['/resources/code-systems', this.codeSystem, 'versions', version, 'summary']);
  }

  protected openVersionConcepts(version: string): void {
    this.router.navigate(['/resources/code-systems', this.codeSystem, 'versions', version, 'concepts']);
  }

  protected duplicateVersion(): void {
    if (!validateForm(this.duplicateModalForm)) {
      return;
    }
    const version = this.duplicateModalData.version;
    const request = {codeSystem: this.codeSystem, version: this.duplicateModalData.targetVersion};
    this.loader.wrap('duplicate', this.codeSystemService.duplicateCodeSystemVersion(this.codeSystem, version, request)).subscribe(() => {
      this.duplicateModalData = {};
      this.versionsChanged.emit();
    });
  }

  protected deleteVersion(version: string): void {
    if (!version) {
      return;
    }
    this.codeSystemService.deleteCodeSystemVersion(this.codeSystem, version).subscribe(() => {
      this.versionsChanged.emit();
    });
  }

  protected getVersions = (versions: CodeSystemVersion[]): string[] => versions.map(v => v.version);

  public openRelease(id: number): void {
    this.router.navigate(['/releases', id, 'summary']);
  }

  protected loadRelease(): void {
    if (this.authService.hasPrivilege('*.Release.read')) {
      this.releaseService.search({resource: ['CodeSystem', this.codeSystem].join('|')}).subscribe(r => {
        this.releases = collect(r.data.flatMap(rel => rel.resources
            .filter(res => res.resourceType === 'CodeSystem')
            .map(res => ({release: rel, resource: res}))),
            i => i.resource.resourceId + i.resource.resourceVersion,
            i => i.release);
      });
    }
  }

  protected toggleReleaseModal(version: CodeSystemVersion): void {
    this.blockVersionOpening();
    this.releaseModal.toggleModal({resourceId: this.codeSystem, resourceVersion: version?.version, resourceTitle: this.codeSystemTitle});
  }

  protected toggleRelatedValueSetModal(version: CodeSystemVersion): void {
    this.blockVersionOpening();
    this.valueSetModal.toggleModal({valueSet: this.codeSystemValueSet, codeSystem: this.codeSystem, codeSystemVersion: version});

  }

  protected blockVersionOpening(): void {
    this.openVersionBlocked = true;
    setTimeout(() => this.openVersionBlocked = false, 150);
  }
}
