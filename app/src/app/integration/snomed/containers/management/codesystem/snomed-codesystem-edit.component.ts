import {Location} from '@angular/common';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {compareStrings, DestroyService, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {SnomedCodeSystem, SnomedCodeSystemVersion} from 'app/src/app/integration/_lib';
import {SnomedService} from 'app/src/app/integration/snomed/services/snomed-service';
import {LorqueLibService} from 'term-web/sys/_lib';


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
  protected importModalData: {visible?: boolean, type?: string, file?: any, progress?: number} = {type: 'SNAPSHOT'};


  @ViewChild("form") public form?: NgForm;
  @ViewChild("exportModalForm") public exportModalForm?: NgForm;
  @ViewChild("importModalForm") public importModalForm?: NgForm;
  @ViewChild("upgradeModalForm") public upgradeModalForm?: NgForm;
  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;

  public constructor(
    private snomedService: SnomedService,
    private lorqueService: LorqueLibService,
    private notificationService: MuiNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private destroy$: DestroyService,
    private location: Location
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
      if (this.route.snapshot.queryParamMap.has('import')) {
        this.importModalData.visible = true;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {import: null},
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
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
      if (resp.finished) {
        this.pollJobStatus(resp.body.jobId);
      } else {
        this.importModalData.progress = resp.progress;
      }
    });
  }

  private getRF2File(jobId: string): void {
    this.exportModalData = {type: 'SNAPSHOT'};
    this.loader.wrap('export', this.snomedService.startRF2FileDownload(jobId)).subscribe(process => {
      this.loader.wrap('export', this.lorqueService.pollFinishedProcess(process.id, this.destroy$)).subscribe(status => {
        if (status === 'failed') {
          this.lorqueService.load(process.id).subscribe(p => this.notificationService.error(p.resultText));
          return;
        }
        this.snomedService.getRF2File(process.id);
      });
    });
  }

  private pollJobStatus(jobId: string): void {
    this.loader.wrap('import', this.snomedService.pollImportJob(jobId, this.destroy$)).subscribe(jobResp => {
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

  protected deleteCodeSystem(): void {
    this.snomedService.deleteCodeSystem(this.snomedCodeSystem.shortName).subscribe(() => this.location.back());
  }
}
