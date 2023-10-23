import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgForm} from '@angular/forms';
import {compareStrings, DestroyService, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {SnomedCodeSystem, SnomedCodeSystemVersion} from 'app/src/app/integration/_lib';
import {SnomedService} from 'app/src/app/integration/snomed/services/snomed-service';
import {saveAs} from 'file-saver';
import {MuiNotificationService} from '@kodality-web/marina-ui';


@Component({
  templateUrl: 'snomed-codesystem-edit.component.html',
  providers: [DestroyService]
})
export class SnomedCodesystemEditComponent implements OnInit {
  protected snomedCodeSystem?: SnomedCodeSystem;
  protected dependantVersions?: SnomedCodeSystemVersion[];
  protected loader = new LoadingManager();

  protected upgradeModalData: {visible?: boolean, dependantVersion?: string} = {};
  protected exportModalData: {visible?: boolean, type?: string} = {type: 'SNAPSHOT'};
  protected importModalData: {visible?: boolean, type?: string, file?: any} = {type: 'SNAPSHOT'};


  @ViewChild("form") public form?: NgForm;
  @ViewChild("exportModalForm") public exportModalForm?: NgForm;
  @ViewChild("importModalForm") public importModalForm?: NgForm;
  @ViewChild("upgradeModalForm") public upgradeModalForm?: NgForm;
  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;

  public constructor(
    private snomedService: SnomedService,
    private notificationService: MuiNotificationService,
    private route: ActivatedRoute,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    const shortName = this.route.snapshot.paramMap.get('shortName');
    this.initData(shortName);
  }

  private initData(shortName: string): void {
    this.loadCodesystem(shortName);
    this.loadDependantVersions();
  }

  private loadDependantVersions(): void {
    this.loader.wrap('load', this.snomedService.loadCodeSystem('SNOMEDCT')).subscribe(cs => {
      this.dependantVersions = cs.versions;
    });
  }

  private loadCodesystem(shortName: string): void {
    this.loader.wrap('load', this.snomedService.loadCodeSystem(shortName)).subscribe(cs => {
      this.snomedCodeSystem = this.writeCodesystem(cs);
    });
  }

  protected save(): void {
    if (!this.validate()) {
      return;
    }
    this.loader.wrap('save', this.snomedService.updateCodeSystem(this.snomedCodeSystem.shortName, this.snomedCodeSystem))
      .subscribe(() => this.loadCodesystem(this.snomedCodeSystem.shortName));
  }

  private validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  private writeCodesystem(cs: SnomedCodeSystem): SnomedCodeSystem {
    return cs;
  }

  protected upgrade(): void {
    if (!validateForm(this.upgradeModalForm)) {
      return;
    }
    this.loader.wrap('export', this.snomedService.upgradeCodeSystem(this.snomedCodeSystem.shortName, this.upgradeModalData.dependantVersion))
      .subscribe(() => this.loadCodesystem(this.snomedCodeSystem.shortName));
  }

  protected exportToRF2(): void {
    if (!validateForm(this.exportModalForm)) {
      return;
    }
    this.loader.wrap('export', this.snomedService.createExportJob({
      branchPath: this.snomedCodeSystem.branchPath,
      type: this.exportModalData.type
    })).subscribe(resp => {
      this.getRF2File(resp.jobId);
    });
  }

  protected importFromRF2(): void {
    if (!validateForm(this.importModalForm)) {
      return;
    }

    const file: Blob = this.fileInput?.nativeElement?.files?.[0];
    this.loader.wrap('import', this.snomedService.createImportJob({
      branchPath: this.snomedCodeSystem.branchPath,
      type: this.importModalData.type,
      createCodeSystemVersion: true
    }, file)).subscribe(resp => {
      this.pollJobStatus(resp.jobId);
    });
  }

  private getRF2File(jobId: string): void {
    this.loader.wrap('export', this.snomedService.getRF2File(jobId)).subscribe(res => {
      this.exportModalData = {};
      saveAs(res, `SnomedCT_Export.zip`);
    });
  }

  private pollJobStatus(jobId: string): void {
    this.loader.wrap('import', this.snomedService.pollJob(jobId, this.destroy$)).subscribe(jobResp => {
      this.importModalData = {type: 'SNAPSHOT'};
      if (jobResp.status === 'FAILED') {
        this.notificationService.error(jobResp.errorMessage || 'web.snomed.branch.management.import-failed');
      }
      if (jobResp.status === 'COMPLETED') {
        this.notificationService.success('web.snomed.branch.management.import-succeeded');
      }
    });
  }

  protected filterDependantVersion = (version: SnomedCodeSystemVersion): boolean => {
    return !this.snomedCodeSystem.latestVersion?.dependantVersionEffectiveTime ||
      compareStrings(version.effectiveDate, this.snomedCodeSystem.latestVersion.dependantVersionEffectiveTime) === 1;
  };

  public startNewAuthoringCycle(): void {
    this.loader.wrap('load', this.snomedService.startNewAuthoringCycle(this.snomedCodeSystem.shortName))
      .subscribe(() => this.initData(this.snomedCodeSystem.shortName));
  }
}
