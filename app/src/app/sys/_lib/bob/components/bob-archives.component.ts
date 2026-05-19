import {CommonModule} from '@angular/common';
import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {LoadingManager, QueryParams} from '@termx-health/core-util';
import {MuiButtonModule, MuiCardModule, MuiCoreModule, MuiNotificationService, MuiPopconfirmModule, MuiTableModule} from '@termx-health/ui';
import {TranslateModule} from '@ngx-translate/core';
import {finalize} from 'rxjs/operators';
import {BobObject} from 'term-web/sys/_lib/bob/model/bob-object';
import {BobLibService} from 'term-web/sys/_lib/bob/services/bob-lib.service';

/**
 * Container-scoped list of {@link BobObject} archives stored on the server. Lets admins
 * upload, download, delete, and (optionally) trigger a per-row action — e.g. "Import" on a
 * SNOMED RF2 zip. The upload uses the streaming {@code POST /bob/objects} endpoint, so
 * multi-hundred-MB files never live in JVM heap.
 *
 * Usage:
 *   <tw-bob-archives container="snomed" actionLabel="Import" (action)="importFromArchive($event)" />
 */
@Component({
  selector: 'tw-bob-archives',
  templateUrl: './bob-archives.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MuiButtonModule, MuiCardModule, MuiCoreModule, MuiPopconfirmModule, MuiTableModule]
})
export class BobArchivesComponent implements OnInit {
  @Input() public container!: string;
  /** Optional per-row action button label. Hidden if not set. */
  @Input() public actionLabel?: string;
  @Output() public action = new EventEmitter<BobObject>();

  protected archives: BobObject[] = [];
  protected loader = new LoadingManager();
  protected uploadProgress?: number;
  protected uploadFile?: File;
  protected uploadDescription?: string;

  private bobService = inject(BobLibService);
  private notificationService = inject(MuiNotificationService);

  public ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loader.wrap('load', this.bobService.query(this.container, Object.assign(new QueryParams(), {limit: 100}) as any))
      .subscribe(resp => this.archives = resp.data || []);
  }

  protected onPickFile(input: HTMLInputElement): void {
    this.uploadFile = input.files?.[0];
  }

  protected upload(): void {
    if (!this.uploadFile) {
      return;
    }
    const file = this.uploadFile;
    this.uploadProgress = 0;
    this.loader.start('upload');
    this.bobService.upload({container: this.container, file, description: this.uploadDescription})
      .pipe(finalize(() => {
        this.loader.stop('upload');
        this.uploadProgress = undefined;
      }))
      .subscribe({
        next: ev => {
          if (ev.finished) {
            this.uploadFile = undefined;
            this.uploadDescription = undefined;
            this.notificationService.success('Archive uploaded');
            this.load();
          } else {
            this.uploadProgress = ev.progress;
          }
        },
        error: err => this.notificationService.error(this.extractError(err)),
      });
  }

  protected download(o: BobObject): void {
    window.open(this.bobService.contentUrl(o.uuid!), '_blank');
  }

  protected remove(o: BobObject): void {
    this.loader.wrap('delete', this.bobService.delete(o.uuid!)).subscribe({
      next: () => {
        this.notificationService.success('Archive deleted');
        this.load();
      },
      error: err => this.notificationService.error(this.extractError(err)),
    });
  }

  protected formatSize(n?: number): string {
    if (!n && n !== 0) {
      return '';
    }
    if (n < 1024) {
      return `${n} B`;
    }
    if (n < 1024 * 1024) {
      return `${(n / 1024).toFixed(1)} KB`;
    }
    if (n < 1024 * 1024 * 1024) {
      return `${(n / 1024 / 1024).toFixed(1)} MB`;
    }
    return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  private extractError(err: any): string {
    const body = err?.error;
    if (Array.isArray(body) && body.length > 0) {
      return body.map((i: any) => i?.message || i?.code || String(i)).join('; ');
    }
    if (body?.message) {
      return body.message;
    }
    return err?.message || 'Request failed';
  }
}
