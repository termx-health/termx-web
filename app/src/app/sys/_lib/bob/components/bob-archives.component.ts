import {CommonModule} from '@angular/common';
import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
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
 * The optional {@link meta} input scopes the card to a logical "owner" — e.g. a specific
 * SNOMED CodeSystem. When set:
 *   - {@code GET /bob/objects?meta=…} is sent so only matching rows are listed.
 *   - Uploads are tagged with the same meta so they show up under the same scope next time.
 *
 * Usage:
 *   <tw-bob-archives container="snomed"
 *                    [meta]="{shortName: cs.shortName, branchPath: cs.branchPath}"
 *                    actionLabel="Import"
 *                    (action)="importFromArchive($event)" />
 */
@Component({
  selector: 'tw-bob-archives',
  templateUrl: './bob-archives.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MuiButtonModule, MuiCardModule, MuiCoreModule, MuiPopconfirmModule, MuiTableModule]
})
export class BobArchivesComponent implements OnInit, OnChanges {
  @Input() public container!: string;
  /** Optional per-row action button label. Hidden if not set. */
  @Input() public actionLabel?: string;
  /**
   * Optional JSONB-containment filter and upload tag — historical shorthand for "use the
   * same map for both filtering the listed rows AND tagging new uploads". Useful when a
   * single page is scoped to one logical owner (e.g. SNOMED CodeSystem edit, where every
   * archive on the page belongs to the same {@code shortName} + {@code branchPath}).
   *
   * <p>If you need the two to differ — e.g. the LOINC import page wants to LIST every
   * stored release regardless of version while TAGGING new uploads with the form's
   * current version — pass {@link uploadMeta} (and/or {@link filterMeta}) instead.
   * {@code uploadMeta} overrides {@code meta} for upload-tagging only; {@code filterMeta}
   * overrides {@code meta} for list-filtering only.
   */
  @Input() public meta?: {[k: string]: any};
  /**
   * Optional override of {@link meta} for the LIST-FILTER side ONLY. Pass {@code {}} (or
   * omit) to show every archive in the container regardless of meta. Doesn't affect the
   * tag applied to new uploads — that still comes from {@link meta} or {@link uploadMeta}.
   */
  @Input() public filterMeta?: {[k: string]: any};
  /**
   * Optional override of {@link meta} for the UPLOAD-TAG side ONLY. New uploads carry this
   * meta map on their {@code BobObject}. Doesn't affect which existing archives are listed
   * — that still comes from {@link meta} or {@link filterMeta}. Useful when the host
   * wants every archive visible but each new upload tagged with a specific version /
   * language / branch.
   */
  @Input() public uploadMeta?: {[k: string]: any};
  @Output() public action = new EventEmitter<BobObject>();
  /**
   * Fired when the user clicks the filename cell. When a listener is bound, the filename
   * renders as a link and the default download-on-click is suppressed — the host component
   * decides whether to navigate, download, open a modal, etc.
   */
  @Output() public itemClick = new EventEmitter<BobObject>();
  /**
   * Fired when the user picks a file in the upload input — BEFORE the upload starts. Lets the
   * host component peek at the file (e.g. parse its name for a version tag) and tweak
   * {@link meta} via two-way binding so the upload picks up the new tag. {@code File | undefined}
   * because clearing the input also fires this with no selection.
   */
  @Output() public fileSelected = new EventEmitter<File | undefined>();
  /**
   * Fired AFTER a successful upload, once the server returns the new {@link BobObject}.
   * Hosts use this to refresh side-state — e.g. the LOINC import page's version dropdown,
   * which is populated from {@code meta.version} across all stored archives, needs to
   * re-query after each new upload to surface the just-added version.
   */
  @Output() public uploaded = new EventEmitter<BobObject>();

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

  public ngOnChanges(changes: SimpleChanges): void {
    // Reload when the FILTER side changes (or container changes). Note we intentionally do
    // NOT reload when uploadMeta changes alone — that only affects upload tagging, not the
    // list. The LOINC page used to lose its existing-versions list every time `data.version`
    // flipped after a new upload because [meta] was driving both filter AND tag.
    if (!changes['container']?.firstChange
        && (changes['container'] || changes['meta'] || changes['filterMeta'])) {
      this.load();
    }
  }

  protected load(): void {
    if (!this.container) {
      return;
    }
    const params: QueryParams & {meta?: any} = Object.assign(new QueryParams(), {limit: 100}) as any;
    const effectiveFilterMeta = this.compactMetaOf(this.filterMeta ?? this.meta);
    if (effectiveFilterMeta) {
      params.meta = effectiveFilterMeta;
    }
    this.loader.wrap('load', this.bobService.query(this.container, params))
      .subscribe(resp => this.archives = resp.data || []);
  }

  protected onPickFile(input: HTMLInputElement): void {
    this.uploadFile = input.files?.[0];
    this.fileSelected.emit(this.uploadFile);
  }

  protected upload(): void {
    if (!this.uploadFile) {
      return;
    }
    const file = this.uploadFile;
    this.uploadProgress = 0;
    this.loader.start('upload');
    this.bobService.upload({
      container: this.container,
      file,
      description: this.uploadDescription,
      meta: this.compactMetaOf(this.uploadMeta ?? this.meta),
    })
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
            if (ev.body) {
              this.uploaded.emit(ev.body);
            }
          } else {
            this.uploadProgress = ev.progress;
          }
        },
        error: err => this.notificationService.error(this.extractError(err)),
      });
  }

  /** Drops {@code undefined} / {@code null} / empty-string values so the server-side
   *  {@code @>} JSONB containment filter doesn't try to match an explicit null.
   *  Returns {@code undefined} when every key was empty, so callers can skip the param
   *  entirely (sending {@code @> {}} would still trivially match everything but generates
   *  ugly noise in server logs). */
  private compactMetaOf(source: {[k: string]: any} | undefined): {[k: string]: any} | undefined {
    if (!source) {
      return undefined;
    }
    const out: {[k: string]: any} = {};
    let any = false;
    for (const key of Object.keys(source)) {
      const v = source[key];
      if (v !== undefined && v !== null && v !== '') {
        out[key] = v;
        any = true;
      }
    }
    return any ? out : undefined;
  }

  protected onItemClick(o: BobObject): void {
    if (this.itemClick.observed) {
      // Host wants to handle the click — typically a route navigation.
      this.itemClick.emit(o);
    } else {
      // No listener bound → preserve the old "click filename downloads" behaviour.
      this.download(o);
    }
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
