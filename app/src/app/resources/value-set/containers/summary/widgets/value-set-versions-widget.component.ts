import {Component, EventEmitter, Input, Output, ViewChild, SimpleChanges, OnChanges} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {LoadingManager, validateForm, collect} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {CodeSystemVersion, ValueSetVersion} from 'app/src/app/resources/_lib';
import {AuthService} from 'term-web/core/auth';
import {ResourceReleaseModalComponent} from 'term-web/resources/resource/components/resource-release-modal-component';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import {ReleaseLibService, Release} from 'term-web/sys/_lib';

@Component({
  selector: 'tw-value-set-versions-widget',
  templateUrl: 'value-set-versions-widget.component.html'
})
export class ValueSetVersionsWidgetComponent implements OnChanges{
  @Input() public valueSet: string;
  @Input() public valueSetTitle: LocalizedName;
  @Input() public versions: ValueSetVersion[];
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
    private valueSetService: ValueSetService,
    private releaseService: ReleaseLibService,
    private authService: AuthService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['valueSet'] && this.valueSet) {
      this.loadRelease();
    }
  }

  protected openVersionSummary(version: string): void {
    if (this.releaseModal.modalVisible) {
      return;
    }
    this.router.navigate(['/resources/value-sets', this.valueSet, 'versions', version, 'summary']);
  }

  protected duplicateVersion(): void {
    if (!validateForm(this.duplicateModalForm)) {
      return;
    }
    const version = this.duplicateModalData.version;
    const request = {valueSet: this.valueSet, version: this.duplicateModalData.targetVersion};
    this.loader.wrap('duplicate', this.valueSetService.duplicateValueSetVersion(this.valueSet, version, request)).subscribe(() => {
      this.duplicateModalData = {};
      this.versionsChanged.emit();
    });
  }

  protected deleteVersion(version: string): void {
    if (!version) {
      return;
    }
    this.valueSetService.deleteValueSetVersion(this.valueSet, version).subscribe(() => {
      this.versions = [...this.versions.filter(v => v.version !== version)];
    });
  }

  protected getVersions = (versions: ValueSetVersion[]): string[] => versions.map(v => v.version);

  public openRelease(id: number): void {
    this.router.navigate(['/releases', id, 'summary']);
  }

  protected loadRelease(): void {
    if (this.authService.hasPrivilege('*.Release.view')) {
      this.releaseService.search({resource: ['ValueSet', this.valueSet].join('|')}).subscribe(r => {
        this.releases = collect(r.data.flatMap(rel => rel.resources
            .filter(res => res.resourceType === 'ValueSet')
            .map(res => ({release: rel, resource: res}))),
            i => i.resource.resourceId + i.resource.resourceVersion,
            i => i.release);
      });
    }
  }
}
