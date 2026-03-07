import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {DestroyService, LoadingManager, validateForm} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {UcumLibService} from 'term-web/ucum/_lib';
import {JobLibService, JobLog} from 'term-web/sys/_lib';

@Component({
  selector: 'tw-integration-ucum-import-modal',
  templateUrl: './integration-ucum-import-modal.component.html',
  providers: [DestroyService]
})
export class IntegrationUcumImportModalComponent {
  @Output() public imported = new EventEmitter<boolean>();

  protected loader = new LoadingManager();
  protected modalVisible = false;
  protected file?: any;

  @ViewChild('form') public form?: NgForm;
  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;

  public constructor(
    private ucumService: UcumLibService,
    private jobService: JobLibService,
    private notificationService: MuiNotificationService,
    private destroy$: DestroyService
  ) {}

  public toggleModal(visible: boolean = false): void {
    this.modalVisible = visible;
    this.file = undefined;
  }

  public import(): void {
    if (!validateForm(this.form)) {
      return;
    }

    const file = this.fileInput?.nativeElement?.files?.[0];
    if (!file) {
      return;
    }

    this.loader.wrap('import', this.ucumService.importEssence(file))
      .subscribe(resp => this.pollJobStatus(resp.jobId));
  }

  private pollJobStatus(jobId?: number): void {
    if (!jobId) {
      this.notificationService.error('Import failed!', 'No job id returned', {duration: 0, closable: true});
      return;
    }
    this.loader.wrap('poll', this.jobService.pollFinishedJobLog(jobId, this.destroy$))
      .subscribe(jobResp => this.processJobResult(jobResp));
  }

  private processJobResult(jobResp: JobLog): void {
    if (!jobResp.errors?.length && !jobResp.warnings?.length) {
      jobResp.successes?.forEach(success => this.notificationService.success('Import successful!', success, {duration: 0, closable: true}));
      if (!jobResp.successes?.length) {
        this.notificationService.success('Import successful!');
      }
      this.toggleModal();
      this.imported.emit(true);
      return;
    }

    jobResp.errors?.forEach(error => this.notificationService.error('Import failed!', error, {duration: 0, closable: true}));
    jobResp.warnings?.forEach(warning => this.notificationService.warning('Import finished with warnings', warning, {duration: 0, closable: true}));
  }
}
