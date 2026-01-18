import {Component, EventEmitter, Input, Output, ViewChild, SimpleChanges, OnChanges} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {LoadingManager, validateForm, collect} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {MapSetVersion} from 'app/src/app/resources/_lib';
import {AuthService} from 'term-web/core/auth';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {ResourceReleaseModalComponent} from 'term-web/resources/resource/components/resource-release-modal-component';
import {Release, ReleaseLibService} from 'term-web/sys/_lib';

@Component({
  selector: 'tw-map-set-versions-widget',
  templateUrl: 'map-set-versions-widget.component.html'
})
export class MapSetVersionsWidgetComponent implements OnChanges{
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

  public constructor(
    private router: Router,
    private mapSetService: MapSetService,
    private releaseService: ReleaseLibService,
    private authService: AuthService
  ) {}

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
