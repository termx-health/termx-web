import {Component} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {saveAs} from 'file-saver';
import {CodeSystem, CodeSystemLibService} from 'term-web/resources/_lib';
import {UcumExportRequest, UcumLibService} from 'term-web/ucum/_lib';

@Component({
  selector: 'tw-ucum-export-modal',
  templateUrl: './ucum-export-modal.component.html',
})
export class UcumExportModalComponent {
  public modalVisible = false;
  public supplements: CodeSystem[] = [];
  public selectedSupplements?: string[];
  protected loader = new LoadingManager();

  public constructor(
    private ucumService: UcumLibService,
    private codeSystemService: CodeSystemLibService,
    private notificationService: MuiNotificationService
  ) {}

  public toggleModal(visible: boolean = false): void {
    this.modalVisible = visible;
    if (visible && !this.supplements.length) {
      this.loadSupplements();
    }
    if (!visible) {
      this.selectedSupplements = undefined;
    }
  }

  public export(): void {
    const request: UcumExportRequest | undefined = this.selectedSupplements?.length ? {supplements: this.selectedSupplements} : undefined;
    this.loader.wrap('export', this.ucumService.export(request))
      .subscribe({
        next: response => {
          saveAs(new Blob([JSON.stringify(response, null, 2)], {type: 'application/json'}), 'ucum-export.json');
          this.notificationService.success('Export completed');
          this.toggleModal();
        },
        error: err => this.notificationService.error('Export failed', err?.message, {duration: 0, closable: true})
      });
  }

  private loadSupplements(): void {
    this.loader.wrap('supplements', this.codeSystemService.search({content: 'supplement', baseCodeSystem: 'ucum', limit: 1000}))
      .subscribe({
        next: resp => this.supplements = resp.data,
        error: err => this.notificationService.error('Failed to load UCUM supplements', err?.message, {duration: 0, closable: true})
      });
  }
}
