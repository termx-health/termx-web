import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { compareStrings, DestroyService, isDefined, LoadingManager, validateForm, FilterPipe, JoinPipe, LocalDateTimePipe, ToStringPipe, ValuesPipe } from '@termx-health/core-util';
import { MuiNotificationService, MuiFormModule, MuiSpinnerModule, MuiCardModule, MarinPageLayoutModule, MuiDropdownModule, MuiCoreModule, MuiPopconfirmModule, MuiTextareaModule, MuiCheckboxModule, MuiButtonModule, MuiModalModule, MuiSelectModule, MuiAlertModule } from '@termx-health/ui';
import {SnomedCodeSystem, SnomedCodeSystemVersion} from 'term-web/integration/_lib';
import {SnomedService} from 'term-web/integration/snomed/services/snomed-service';
import {LorqueLibService} from 'term-web/sys/_lib';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { NzProgressComponent } from 'ng-zorro-antd/progress';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: 'snomed-codesystem-edit.component.html',
    providers: [DestroyService],
    imports: [MuiFormModule, MuiSpinnerModule, FormsModule, MuiCardModule, MarinPageLayoutModule, MuiDropdownModule, PrivilegedDirective, MuiCoreModule, MuiPopconfirmModule, MuiTextareaModule, MuiCheckboxModule, MuiButtonModule, MuiModalModule, MuiSelectModule, NzProgressComponent, MuiAlertModule, TranslatePipe, FilterPipe, JoinPipe, LocalDateTimePipe, ToStringPipe, ValuesPipe]
})
export class SnomedCodesystemEditComponent implements OnInit {
  private snomedService = inject(SnomedService);
  private lorqueService = inject(LorqueLibService);
  private notificationService = inject(MuiNotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = inject(DestroyService);
  private location = inject(Location);

  protected snomedCodeSystem?: SnomedCodeSystem;
  protected dependantVersions?: SnomedCodeSystemVersion[];
  protected loader = new LoadingManager();

  protected upgradeModalData: {visible?: boolean, dependantVersion?: string} = {};
  protected exportModalData: {visible?: boolean, type?: string} = {type: 'SNAPSHOT'};
  protected importModalData: {visible?: boolean, type?: string, file?: any, progress?: number, progressNote?: string, dryRun?: boolean, fullMode?: boolean, phase?: 'uploading' | 'scanning'} = {type: 'SNAPSHOT'};


  @ViewChild("form") public form?: NgForm;
  @ViewChild("exportModalForm") public exportModalForm?: NgForm;
  @ViewChild("importModalForm") public importModalForm?: NgForm;
  @ViewChild("upgradeModalForm") public upgradeModalForm?: NgForm;
  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;

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

    const file: File | undefined = this.fileInput?.nativeElement?.files?.[0];
    const filename = file?.name;
    const request: {branchPath: string, type: string, createCodeSystemVersion: boolean, mode?: 'summary' | 'full'} = {
      branchPath: this.snomedCodeSystem.branchPath,
      type: this.importModalData.type,
      createCodeSystemVersion: true
    };

    this.importModalData.phase = 'uploading';
    this.importModalData.progress = 0;

    if (this.importModalData.dryRun) {
      request.mode = this.importModalData.fullMode ? 'full' : 'summary';
      this.loader.wrap('import', this.snomedService.scanRF2(request, file, filename)).subscribe(resp => {
        if (resp.finished) {
          this.importModalData.phase = 'scanning';
          this.importModalData.progress = undefined;
          this.handleScanLorqueStarted(resp.body);
        } else {
          this.importModalData.progress = resp.progress;
        }
      });
      return;
    }

    this.loader.wrap('import', this.snomedService.createImportJob(request, file)).subscribe(resp => {
      if (resp.finished) {
        this.pollJobStatus(resp.body.jobId);
      } else {
        this.importModalData.progress = resp.progress;
      }
    });
  }

  private handleScanLorqueStarted(lorque: {id: number}): void {
    this.loader.wrap('import', this.lorqueService.pollProcessProgress(lorque.id, this.destroy$)).subscribe(p => {
      if (p?.progressPercent != null) {
        this.importModalData.progress = p.progressPercent;
      }
      if (p?.progressNote) {
        this.importModalData.progressNote = p.progressNote;
      }
      if (!p?.status || p.status === 'running') {
        return;
      }
      this.importModalData.phase = undefined;
      if (p.status === 'failed') {
        this.lorqueService.load(lorque.id).subscribe(loaded => this.notificationService.error(loaded.resultText));
        return;
      }
      this.snomedService.loadScanResult(lorque.id).subscribe(envelope => {
        this.importModalData = {type: 'SNAPSHOT'};
        this.router.navigate(
          ['/integration/snomed/codesystems', this.snomedCodeSystem.shortName, 'rf2-scan-result'],
          {state: {envelope, shortName: this.snomedCodeSystem.shortName}}
        );
      });
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
      compareStrings(String(version.effectiveDate), this.snomedCodeSystem.dependantVersionEffectiveTime) === 1;
  };

  protected deleteCodeSystem(): void {
    this.snomedService.deleteCodeSystem(this.snomedCodeSystem.shortName).subscribe(() => this.location.back());
  }
}
