import { Component, EventEmitter, Input, Output, ViewChild, SimpleChanges, OnChanges, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import { LoadingManager, validateForm, collect, ApplyPipe, JoinPipe, LocalDatePipe, SortPipe } from '@termx-health/core-util';
import { LocalizedName, MarinaUtilModule } from '@termx-health/util';
import {MapSetVersion} from 'term-web/resources/_lib';
import {AuthService} from 'term-web/core/auth';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {ResourceReleaseModalComponent} from 'term-web/resources/resource/components/resource-release-modal-component';
import {Release, ReleaseLibService} from 'term-web/sys/_lib';

import { MuiNoDataModule, MuiListModule, MuiDividerModule, MuiDropdownModule, MuiCoreModule, MuiIconModule, MuiPopconfirmModule, MuiModalModule, MarinPageLayoutModule, MuiFormModule, MuiButtonModule } from '@termx-health/ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import { ResourceReleaseModalComponent as ResourceReleaseModalComponent_1 } from 'term-web/resources/resource/components/resource-release-modal-component';
import { TranslatePipe } from '@ngx-translate/core';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    selector: 'tw-map-set-versions-widget',
    templateUrl: 'map-set-versions-widget.component.html',
    imports: [MuiNoDataModule, MuiListModule, MuiDividerModule, StatusTagComponent, PrivilegedDirective, MuiDropdownModule, MuiCoreModule, MuiIconModule, MuiPopconfirmModule, MuiModalModule, MarinPageLayoutModule, FormsModule, MuiFormModule, SemanticVersionSelectComponent, MuiButtonModule, ResourceReleaseModalComponent_1, TranslatePipe, MarinaUtilModule, ApplyPipe, JoinPipe, LocalDatePipe, SortPipe, PrivilegedPipe]
})
export class MapSetVersionsWidgetComponent implements OnChanges{
  private router = inject(Router);
  private mapSetService = inject(MapSetService);
  private releaseService = inject(ReleaseLibService);
  private authService = inject(AuthService);

  @Input() public mapSet: string;
  @Input() public mapSetTitle: LocalizedName;
  @Input() public versions: MapSetVersion[];
  @Output() public versionsChanged: EventEmitter<void> = new EventEmitter();

  protected loader = new LoadingManager();
  protected releases: {[key: string]: Release[]};

  protected duplicateModalData: {
    visible?: boolean,
    version?: string,
    targetVersion?: string
  } = {};
  @ViewChild("duplicateModalForm") public duplicateModalForm?: NgForm;
  @ViewChild("releaseModal") public releaseModal?: ResourceReleaseModalComponent;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['mapSet'] && this.mapSet) {
      this.loadRelease();
    }
  }

  protected openVersionSummary(version: string): void {
    if (this.releaseModal.modalVisible) {
      return;
    }
    this.router.navigate(['/resources/map-sets', this.mapSet, 'versions', version, 'summary']);
  }

  protected duplicateVersion(): void {
    if (!validateForm(this.duplicateModalForm)) {
      return;
    }
    const version = this.duplicateModalData.version;
    const request = {mapSet: this.mapSet, version: this.duplicateModalData.targetVersion};
    this.loader.wrap('duplicate', this.mapSetService.duplicateMapSetVersion(this.mapSet, version, request)).subscribe(() => {
      this.duplicateModalData = {};
      this.versionsChanged.emit();
    });
  }

  protected deleteVersion(version: string): void {
    if (!version) {
      return;
    }
    this.mapSetService.deleteMapSetVersion(this.mapSet, version).subscribe(() => this.versionsChanged.emit());
  }

  protected getVersions = (versions: MapSetVersion[]): string[] => versions.map(v => v.version);

  public openRelease(id: number): void {
    this.router.navigate(['/releases', id, 'summary']);
  }

  protected loadRelease(): void {
    if (this.authService.hasPrivilege('*.Release.view')) {
      this.releaseService.search({resource: ['MapSet', this.mapSet].join('|')}).subscribe(r => {
        this.releases = collect(r.data.flatMap(rel => rel.resources
            .filter(res => res.resourceType === 'MapSet')
            .map(res => ({release: rel, resource: res}))),
            i => i.resource.resourceId + i.resource.resourceVersion,
            i => i.release);
      });
    }
  }
}
