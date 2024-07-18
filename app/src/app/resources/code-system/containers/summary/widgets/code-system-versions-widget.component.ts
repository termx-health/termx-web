import {Component, EventEmitter, Input, Output, ViewChild, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {LoadingManager, validateForm, collect} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {CodeSystemVersion} from 'app/src/app/resources/_lib';
import {AuthService} from 'term-web/core/auth';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {ResourceReleaseModalComponent} from 'term-web/resources/resource/components/resource-release-modal-component';
import {ValueSetVersionSaveModalComponent} from 'term-web/resources/value-set/components/value-set-version-save-modal-component';
import {Release, ReleaseLibService} from 'term-web/sys/_lib';

@Component({
  selector: 'tw-code-system-versions-widget',
  templateUrl: 'code-system-versions-widget.component.html'
})
export class CodeSystemVersionsWidgetComponent implements OnChanges {
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

  public constructor(
    private router: Router,
    private codeSystemService: CodeSystemService,
    private releaseService: ReleaseLibService,
    private authService: AuthService
  ) {}

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
    if (this.authService.hasPrivilege('*.Release.view')) {
      this.releaseService.search({resource: ['CodeSystem', this.codeSystem].join('|')}).subscribe(r => {
        this.releases = collect(r.data.flatMap(rel => rel.resources.map(res => ({release: rel, resource: res}))),
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
