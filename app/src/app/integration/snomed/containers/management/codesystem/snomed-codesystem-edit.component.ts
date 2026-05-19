import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { compareStrings, DestroyService, isDefined, LoadingManager, validateForm, FilterPipe, JoinPipe, LocalDateTimePipe, ToStringPipe, ValuesPipe } from '@termx-health/core-util';
import { MuiNotificationService, MuiFormModule, MuiSpinnerModule, MuiCardModule, MarinPageLayoutModule, MuiDropdownModule, MuiCoreModule, MuiPopconfirmModule, MuiTextareaModule, MuiCheckboxModule, MuiButtonModule, MuiModalModule, MuiSelectModule, MuiAlertModule } from '@termx-health/ui';
import {SnomedCodeSystem, SnomedCodeSystemVersion} from 'term-web/integration/_lib';
import {SnomedService} from 'term-web/integration/snomed/services/snomed-service';
import {BobArchivesComponent, BobLibService, BobObject, LorqueLibService} from 'term-web/sys/_lib';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { NzProgressComponent } from 'ng-zorro-antd/progress';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: 'snomed-codesystem-edit.component.html',
    providers: [DestroyService],
    imports: [MuiFormModule, MuiSpinnerModule, FormsModule, MuiCardModule, MarinPageLayoutModule, MuiDropdownModule, PrivilegedDirective, MuiCoreModule, MuiPopconfirmModule, MuiTextareaModule, MuiCheckboxModule, MuiButtonModule, MuiModalModule, MuiSelectModule, NzProgressComponent, MuiAlertModule, TranslatePipe, FilterPipe, JoinPipe, LocalDateTimePipe, ToStringPipe, ValuesPipe, BobArchivesComponent]
})
export class SnomedCodesystemEditComponent implements OnInit {
  private snomedService = inject(SnomedService);
  private bobService = inject(BobLibService);
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
  protected importModalData: {visible?: boolean, type?: string, file?: any, progress?: number, phase?: 'uploading'} = {type: 'SNAPSHOT'};


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

  /**
   * "Import from RF2" modal: stream-upload the zip to the Bob "snomed" container (heap-safe
   * even on full International editions) and then navigate to the per-archive detail page.
   * From there the admin reviews the upload, picks a baseline, calculates a delta, and chooses
   * what to push to Snowstorm. The legacy "Dry run" checkbox is gone — every upload lands on
   * the same detail page, dry-run-style or not.
   */
  protected importFromRF2(): void {
    if (!validateForm(this.importModalForm)) {
      return;
    }
    const file: File | undefined = this.fileInput?.nativeElement?.files?.[0];
    if (!file) {
      return;
    }

    const branchPath = this.snomedCodeSystem.branchPath;
    this.importModalData.phase = 'uploading';
    this.importModalData.progress = 0;

    // Tag the upload with the current CS so the Stored archives card filters to this CS, and
    // so the per-archive detail page can pre-fill branchPath / rf2Type without re-asking.
    const archiveMeta = {
      shortName: this.snomedCodeSystem.shortName,
      branchPath,
      rf2Type: this.importModalData.type,
    };

    this.loader.wrap('import', this.bobService.upload({
      container: 'snomed',
      file,
      description: `${this.importModalData.type ?? 'SNAPSHOT'} upload for ${this.snomedCodeSystem.shortName}`,
      meta: archiveMeta,
    })).subscribe({
      next: ev => {
        if (!ev.finished) {
          this.importModalData.progress = ev.progress;
          return;
        }
        // Upload done — close the modal and route to the archive detail page. Calculate
        // Delta / Upload to Snowstorm live there.
        const uuid = ev.body!.uuid!;
        this.importModalData = {type: 'SNAPSHOT'};
        this.router.navigate([
          '/integration/snomed/codesystems',
          this.snomedCodeSystem.shortName,
          'archives',
          uuid,
        ]);
      },
      error: err => this.handleImportError(err),
    });
  }

  /**
   * The from-archive import Lorque process completes after Bob → Snowstorm streaming finishes
   * and the tracking row is written; result text holds {"jobId":"…"}. We then hand off to the
   * existing Snowstorm-side job poller, exactly like the legacy createImportJob path.
   *
   * Kept for compatibility with the per-row Import button on the Stored archives card while
   * the new archive detail page rolls out — see {@link importFromArchive} below.
   */
  private handleImportLorqueStarted(lorque: {id: number}): void {
    this.lorqueService.pollProcessProgress(lorque.id, this.destroy$).subscribe(p => {
      if (p?.progressPercent != null) {
        // Existing modal-progress UI is gone; we used to mirror this onto importModalData.
        // The detail page has its own progress handling now; this is no-op here.
      }
      if (!p?.status || p.status === 'running') {
        return;
      }
      if (p.status === 'failed') {
        this.lorqueService.load(lorque.id).subscribe(loaded => this.notificationService.error(loaded.resultText));
        return;
      }
      // status === 'completed' — pull the {jobId} payload and hand to existing poller.
      this.lorqueService.load(lorque.id).subscribe(loaded => {
        try {
          const payload = JSON.parse(loaded.resultText || '{}');
          if (payload.jobId) {
            this.pollJobStatus(payload.jobId);
          }
        } catch {
          // payload was not JSON — just close the modal
          this.importModalData = {type: 'SNAPSHOT'};
        }
      });
    });
  }

  /**
   * Clicking a row's Import button on <tw-bob-archives> just navigates to the per-archive
   * detail page now — Snowstorm imports live there alongside Calculate Delta. The actual
   * /imports/from-archive POST is moved into {@link SnomedArchiveDetailComponent}.
   */
  protected importFromArchive(archive: BobObject): void {
    if (!archive?.uuid || !this.snomedCodeSystem) {
      return;
    }
    this.router.navigate([
      '/integration/snomed/codesystems',
      this.snomedCodeSystem.shortName,
      'archives',
      archive.uuid,
    ]);
  }

  private handleImportError(err: any): void {
    // Close the modal entirely — clearing file/state so the user can't accidentally
    // click Confirm again and re-upload the same archive into the same broken backend.
    this.importModalData = {type: 'SNAPSHOT'};
    this.notificationService.error(this.extractErrorMessage(err));
  }

  private extractErrorMessage(err: any): string {
    // termx-server's DefaultExceptionHandler returns either a JSON array of Issue
    // objects ({code, message, severity, params}) or a single Issue, depending on
    // the upstream failure. Empty bodies (e.g. an upstream 403 with Content-Length:0)
    // come through as null/[]. Walk all the shapes; fall back to "<status> <statusText>".
    const body = err?.error;
    if (Array.isArray(body) && body.length > 0) {
      const messages = body
        .map((i: any) => (typeof i === 'string' ? i : (i?.message || i?.code)))
        .filter((m: any) => !!m);
      if (messages.length > 0) {
        return messages.join('; ');
      }
    }
    if (body?.message) {
      return body.message;
    }
    if (body?.detail) {
      return body.detail;
    }
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (err?.status) {
      const status = err.statusText ? `${err.status} ${err.statusText}` : `HTTP ${err.status}`;
      return err.url ? `${status} (${err.url})` : status;
    }
    return err?.message || 'web.snomed.branch.management.import-failed';
  }

  // handleScanLorqueStarted has been removed — the legacy dry-run flow now lives on the
  // per-archive detail page (Calculate Delta button), so this modal no longer needs the
  // scan-result navigation path. The /rf2-scan-result route stays available for any
  // bookmarked URLs but no UI links to it any more.

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
    this.loader.wrap('import', this.snomedService.pollImportJob(jobId, this.destroy$)).subscribe({
      next: jobResp => {
        this.importModalData = {type: 'SNAPSHOT'};
        if (jobResp.status === 'FAILED') {
          this.notificationService.error(jobResp.errorMessage || 'web.snomed.branch.management.import-failed');
        }
        if (jobResp.status === 'COMPLETED') {
          this.notificationService.success('web.snomed.branch.management.import-succeeded');
        }
      },
      error: err => this.handleImportError(err)
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
